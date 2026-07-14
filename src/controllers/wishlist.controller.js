const Wishlist = require("../models/wishlist.model");
const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getPagination = require("../helpers/pagination.helper");

const addCourseToWishlist = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  if (course.status !== "published") {
    return next(
      new AppError(
        "Only published courses can be added to the wishlist",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const isInstructor = course.instructor.toString() === req.user._id.toString();

  if (isInstructor) {
    return next(
      new AppError(
        "You cannot add your own course to the wishlist",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingWishlistItem = await Wishlist.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingWishlistItem) {
    return next(
      new AppError(
        "Course is already in your wishlist",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const wishlistItem = await Wishlist.create({
    user: req.user._id,
    course: course._id,
  });

  await wishlistItem.populate({
    path: "course",
    select:
      "title description price coverImage averageRating ratingsCount status category instructor",
    populate: [
      {
        path: "category",
        select: "name slug",
      },
      {
        path: "instructor",
        select: "firstName lastName avatar",
      },
    ],
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Course added to wishlist successfully",
    data: {
      wishlistItem,
    },
  });
});

const getMyWishlist = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const courseFilter = {};

  if (req.query.search?.trim()) {
    courseFilter.title = {
      $regex: req.query.search.trim(),
      $options: "i",
    };
  }

  const sortOptions = {
    newest: {
      createdAt: -1,
    },
    oldest: {
      createdAt: 1,
    },
  };

  const wishlistSort = sortOptions[req.query.sort] || sortOptions.newest;

  if (req.query.sort === "price-asc" || req.query.sort === "price-desc") {
    const priceSort = req.query.sort === "price-asc" ? 1 : -1;

    const pipeline = [
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      ...(req.query.search?.trim()
        ? [
            {
              $match: {
                "course.title": {
                  $regex: req.query.search.trim(),
                  $options: "i",
                },
              },
            },
          ]
        : []),
      {
        $sort: {
          "course.price": priceSort,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const countPipeline = [
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      ...(req.query.search?.trim()
        ? [
            {
              $match: {
                "course.title": {
                  $regex: req.query.search.trim(),
                  $options: "i",
                },
              },
            },
          ]
        : []),
      {
        $count: "total",
      },
    ];

    const [wishlistItems, countResult] = await Promise.all([
      Wishlist.aggregate(pipeline),
      Wishlist.aggregate(countPipeline),
    ]);

    const totalWishlistItems = countResult[0]?.total || 0;

    const totalPages = Math.ceil(totalWishlistItems / limit);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      results: wishlistItems.length,
      data: {
        wishlistItems,
        pagination: {
          currentPage: page,
          limit,
          totalWishlistItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  }

  const matchedCourses = await Course.find(courseFilter).select("_id").lean();

  const courseIds = matchedCourses.map((course) => course._id);

  const filter = {
    user: req.user._id,
  };

  if (req.query.search?.trim()) {
    filter.course = {
      $in: courseIds,
    };
  }

  const [wishlistItems, totalWishlistItems] = await Promise.all([
    Wishlist.find(filter)
      .populate({
        path: "course",
        select:
          "title description price coverImage averageRating ratingsCount status category instructor",
        populate: [
          {
            path: "category",
            select: "name slug",
          },
          {
            path: "instructor",
            select: "firstName lastName avatar",
          },
        ],
      })
      .sort(wishlistSort)
      .skip(skip)
      .limit(limit),

    Wishlist.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalWishlistItems / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: wishlistItems.length,
    data: {
      wishlistItems,
      pagination: {
        currentPage: page,
        limit,
        totalWishlistItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const getWishlistCourseStatus = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select("_id title");

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const wishlistItem = await Wishlist.findOne({
    user: req.user._id,
    course: course._id,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isWishlisted: Boolean(wishlistItem),
      wishlistItem,
    },
  });
});

const removeCourseFromWishlist = asyncWrapper(async (req, res, next) => {
  const wishlistItem = await Wishlist.findOneAndDelete({
    user: req.user._id,
    course: req.params.courseId,
  });

  if (!wishlistItem) {
    return next(
      new AppError("Course is not in your wishlist", 404, httpStatusText.FAIL),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course removed from wishlist successfully",
    data: null,
  });
});

const clearMyWishlist = asyncWrapper(async (req, res) => {
  const result = await Wishlist.deleteMany({
    user: req.user._id,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message:
      result.deletedCount === 0
        ? "Wishlist is already empty"
        : "Wishlist cleared successfully",
    data: {
      deletedItems: result.deletedCount,
    },
  });
});

module.exports = {
  addCourseToWishlist,
  getMyWishlist,
  getWishlistCourseStatus,
  removeCourseFromWishlist,
  clearMyWishlist,
};
