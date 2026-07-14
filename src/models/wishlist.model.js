const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Wishlist user is required"],
            index: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Wishlist course is required"],
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Index
wishlistSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);