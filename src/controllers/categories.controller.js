const slugify = require("slugify");

const Category = require("../models/category.model");
const Course = require("../models/course.model");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const createSlug = (name) => {
  return slugify(name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true,
    strict: true,
  });
};

const createCategory = asyncWrapper(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  const slug = createSlug(name);

  const existingCategory = await Category.findOne({ slug });

  if (existingCategory) {
    return next(
      new AppError(
        "A category with this name already exists",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description,
    isActive,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Category created successfully",
    data: {
      category,
    },
  });
});

const getAllCategories = asyncWrapper(async (req, res, next) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const skip = (page - 1) * limit;
    const filter = {};

     if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  } else {
    filter.isActive = true;
  }

   if (req.query.search?.trim()) {
    const searchValue = req.query.search.trim();

    filter.$or = [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  const [categories, totalCategories] = await Promise.all([
    Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(totalCategories / limit);

 res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: categories.length,
    data: {
      categories,
      pagination: {
        currentPage: page,
        limit,
        totalCategories,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const getCategory = asyncWrapper(async (req, res, next) => {
    const {identifier} = req.params;

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);

     const filter = isMongoId
    ? { _id: identifier }
    : { slug: identifier };

    const category = await Category.findOne(filter);

    if(!category){
        return next(
            new AppError(
              "Category not found",
              404,
              httpStatusText.FAIL,
            ),
        )
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            category,
        },
    });
})

const updateCategory = asyncWrapper(async (req, res, next) => {
  const category = await Category.findById(
    req.params.categoryId
  );

  if (!category) {
    return next(
      new AppError(
        "Category not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  const { name, description, isActive } = req.body;

  if (name !== undefined) {
    const normalizedName = name.trim();
    const newSlug = createSlug(normalizedName);

    const existingCategory = await Category.findOne({
      _id: { $ne: category._id },
      $or: [
        { name: normalizedName },
        { slug: newSlug },
      ],
    });

    if (existingCategory) {
      return next(
        new AppError(
          "Category name already exists",
          409,
          httpStatusText.FAIL
        )
      );
    }

    category.name = normalizedName;
    category.slug = newSlug;
  }

  if (description !== undefined) {
    category.description = description;
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  await category.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Category updated successfully",
    data: {
      category,
    },
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:categoryId
 * @access  Admin
 */
const deleteCategory = asyncWrapper(async (req, res, next) => {
  const category = await Category.findById(
    req.params.categoryId
  );

  if (!category) {
    return next(
      new AppError(
        "Category not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  const coursesCount = await Course.countDocuments({
    category: category._id,
  });

  if (coursesCount > 0) {
    return next(
      new AppError(
        "Cannot delete a category that contains courses",
        409,
        httpStatusText.FAIL
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Category deleted successfully",
    data: null,
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};