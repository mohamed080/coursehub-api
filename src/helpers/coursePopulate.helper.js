const populateCourse = async (course) => {
    return course.populate([
        {
            path: "instructor",
            select: "firstName lastName email avatar",
        },
        {
            path: "category",
            select: "name slug description",
        },
    ]);
};

module.exports = populateCourse;