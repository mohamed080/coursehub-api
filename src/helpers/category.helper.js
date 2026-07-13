const Category = require("../models/category.model");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getActiveCategory = async (categoryId) => {
    const category = await Category.findOne({
        _id: categoryId,
        isActive: true,
    });

    if (!category) {
        throw new AppError(
            "Category not found",
            404,
            httpStatusText.FAIL
        );
    }

    return category;
};

module.exports = {
    getActiveCategory,
};