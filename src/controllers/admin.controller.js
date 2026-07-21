const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const getPagination = require("../helpers/pagination.helper");
const { deleteCloudinaryImage } = require("../helpers/cloudinary.helper");
const { jsonToCsv } = require("../helpers/csv.helper");
const { Activity, logActivity } = require("../models/activity.model");

const {
  getCurrentMonthRange,
  buildMonthlyBuckets,
  parseDateRange,
  parseYear,
  User,
  Course,
  Enrollment,
  Payment,
  Review,
} = require("../helpers/adminAnalytics.helper");

// ──────────────────────────────────────────────────────────
// 1. DASHBOARD & ANALYTICS
// ──────────────────────────────────────────────────────────

// GET /api/admin/dashboard
const getAdminDashboard = asyncWrapper(async (req, res) => {
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

  const [
    totalUsers,
    studentCount,
    instructorCount,
    adminCount,
    newUsersThisMonth,

    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,

    totalEnrollments,
    activeEnrollments,
    completedEnrollments,

    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    revenueData,
    revenueThisMonth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "instructor" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } }),

    Course.countDocuments(),
    Course.countDocuments({ status: "published" }),
    Course.countDocuments({ status: "draft" }),
    Course.countDocuments({ status: "archived" }),

    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: "active" }),
    Enrollment.countDocuments({ status: "completed" }),

    Payment.countDocuments(),
    Payment.countDocuments({ status: "paid" }),
    Payment.countDocuments({ status: "pending" }),
    Payment.countDocuments({ status: "failed" }),

    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),

    Payment.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: monthStart, $lt: monthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      users: {
        total: totalUsers,
        students: studentCount,
        instructors: instructorCount,
        admins: adminCount,
        newThisMonth: newUsersThisMonth,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        archived: archivedCourses,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
      },
      revenue: {
        total: revenueData[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
      },
      payments: {
        total: totalPayments,
        paid: paidPayments,
        pending: pendingPayments,
        failed: failedPayments,
      },
    },
  });
});

// GET /api/admin/revenue?from=2026-01-01&to=2026-06-30 OR ?year=2026
const getAdminRevenueChart = asyncWrapper(async (req, res) => {
  const range = parseDateRange(req.query);

  const raw = await Payment.aggregate([
    {
      $match: {
        status: "paid",
        paidAt: { $gte: range.startDate, $lte: range.endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$paidAt" } },
        revenue: { $sum: "$finalAmount" },
        sales: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const revenueByMonth = buildMonthlyBuckets(
    raw.map((r) => ({ _id: r._id, revenue: r.revenue, sales: r.sales })),
    "revenue"
  ).map((bucket, i) => ({
    ...bucket,
    sales: raw.find((r) => r._id && r._id.month === i + 1)?.sales || 0,
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isCustomRange: range.isCustomRange,
      startDate: range.startDate,
      endDate: range.endDate,
      year: range.year || null,
      revenueByMonth,
    },
  });
});

// GET /api/admin/enrollments?from=2026-01-01&to=2026-06-30 OR ?year=2026
const getAdminEnrollmentChart = asyncWrapper(async (req, res) => {
  const range = parseDateRange(req.query);

  const raw = await Enrollment.aggregate([
    {
      $match: { enrolledAt: { $gte: range.startDate, $lte: range.endDate } },
    },
    {
      $group: {
        _id: { month: { $month: "$enrolledAt" } },
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const enrollmentsByMonth = buildMonthlyBuckets(raw, "enrollments");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isCustomRange: range.isCustomRange,
      startDate: range.startDate,
      endDate: range.endDate,
      year: range.year || null,
      enrollmentsByMonth,
    },
  });
});

// GET /api/admin/users/growth?from=2026-01-01&to=2026-06-30 OR ?year=2026
const getAdminUserGrowthChart = asyncWrapper(async (req, res) => {
  const range = parseDateRange(req.query);

  const raw = await User.aggregate([
    {
      $match: { createdAt: { $gte: range.startDate, $lte: range.endDate } },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        users: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const userGrowthByMonth = buildMonthlyBuckets(raw, "users");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      isCustomRange: range.isCustomRange,
      startDate: range.startDate,
      endDate: range.endDate,
      year: range.year || null,
      userGrowthByMonth,
    },
  });
});

// GET /api/admin/top-courses?sortBy=revenue&limit=5
const getAdminTopCourses = asyncWrapper(async (req, res) => {
  const sortBy = req.query.sortBy || "revenue";
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const sortField =
    sortBy === "students"
      ? "students"
      : sortBy === "rating"
      ? "averageRating"
      : "revenue";

  const courses = await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: "$course",
        revenue: { $sum: "$finalAmount" },
        sales: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "course",
        as: "enrollmentDocs",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDoc",
      },
    },
    { $unwind: "$courseDoc" },
    {
      $lookup: {
        from: "users",
        localField: "courseDoc.instructor",
        foreignField: "_id",
        as: "instructorDoc",
      },
    },
    { $unwind: { path: "$instructorDoc", preserveNullAndEmpty: true } },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        title: "$courseDoc.title",
        coverImage: "$courseDoc.coverImage",
        status: "$courseDoc.status",
        price: "$courseDoc.price",
        averageRating: "$courseDoc.averageRating",
        ratingsCount: "$courseDoc.ratingsCount",
        instructor: {
          _id: "$instructorDoc._id",
          firstName: "$instructorDoc.firstName",
          lastName: "$instructorDoc.lastName",
          avatar: "$instructorDoc.avatar",
        },
        revenue: 1,
        sales: 1,
        students: { $size: "$enrollmentDocs" },
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: courses.length,
    data: { sortBy, courses },
  });
});

// GET /api/admin/top-instructors?sortBy=revenue&limit=5
const getAdminTopInstructors = asyncWrapper(async (req, res) => {
  const sortBy = req.query.sortBy || "revenue";
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const sortField = sortBy === "students" ? "students" : "revenue";

  const instructors = await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDoc",
      },
    },
    { $unwind: "$courseDoc" },
    {
      $group: {
        _id: "$courseDoc.instructor",
        revenue: { $sum: "$finalAmount" },
        sales: { $sum: 1 },
        courseIds: { $addToSet: "$course" },
      },
    },
    {
      $lookup: {
        from: "enrollments",
        localField: "courseIds",
        foreignField: "course",
        as: "enrollmentDocs",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "instructorDoc",
      },
    },
    { $unwind: "$instructorDoc" },
    {
      $project: {
        _id: 0,
        instructorId: "$_id",
        firstName: "$instructorDoc.firstName",
        lastName: "$instructorDoc.lastName",
        avatar: "$instructorDoc.avatar",
        email: "$instructorDoc.email",
        isInstructorVerified: "$instructorDoc.isInstructorVerified",
        totalCourses: { $size: "$courseIds" },
        students: { $size: "$enrollmentDocs" },
        revenue: 1,
        sales: 1,
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: instructors.length,
    data: { sortBy, instructors },
  });
});

// ──────────────────────────────────────────────────────────
// 2. USER MANAGEMENT
// ──────────────────────────────────────────────────────────

// GET /api/admin/users?search=alex&role=user&status=active&page=1&limit=10
const getAdminUsers = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { isDeleted: false };

  if (req.query.search?.trim()) {
    const searchValue = req.query.search.trim();
    filter.$text = { $search: searchValue };
  }

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.status !== undefined) {
    if (req.query.status === "active") filter.isActive = true;
    else if (req.query.status === "blocked" || req.query.status === "inactive")
      filter.isActive = false;
    else if (req.query.status === "true") filter.isActive = true;
    else if (req.query.status === "false") filter.isActive = false;
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .select("-passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: users.length,
    data: {
      users,
      pagination: {
        currentPage: page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// GET /api/admin/users/:id
const getAdminUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-passwordResetToken -passwordResetExpires"
  );

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  const [enrollmentsCount, coursesCreated, paymentsHistory] = await Promise.all(
    [
      Enrollment.countDocuments({ user: user._id }),
      Course.find({ instructor: user._id }).select(
        "title status price coverImage averageRating ratingsCount createdAt"
      ),
      Payment.find({ user: user._id })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(10),
    ]
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
      statistics: {
        enrollmentsCount,
        coursesCount: coursesCreated.length,
        paymentsCount: paymentsHistory.length,
      },
      coursesCreated,
      paymentsHistory,
    },
  });
});

// PATCH /api/admin/users/:id/status
const updateAdminUserStatus = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  const { isActive, role } = req.body;

  if (isActive !== undefined) {
    user.isActive = Boolean(isActive);
  }

  if (role && ["user", "instructor", "admin"].includes(role)) {
    user.role = role;
  }

  await user.save();

  await logActivity({
    type: "user_status_change",
    user: req.user._id,
    message: `Admin ${req.user.firstName} updated user ${user.email} (isActive: ${user.isActive}, role: ${user.role})`,
    metadata: { targetUserId: user._id, isActive: user.isActive, role: user.role },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User status updated successfully",
    data: { user: user.toSafeObject() },
  });
});

// DELETE /api/admin/users/:id
const deleteAdminUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(
      new AppError(
        "You cannot delete your own admin account",
        400,
        httpStatusText.FAIL
      )
    );
  }

  if (user.role === "admin") {
    return next(
      new AppError("Cannot delete an admin account", 400, httpStatusText.FAIL)
    );
  }

  user.isDeleted = true;
  user.isActive = false;
  await user.save();

  await logActivity({
    type: "user_status_change",
    user: req.user._id,
    message: `Admin ${req.user.firstName} soft-deleted user ${user.email}`,
    metadata: { targetUserId: user._id, isDeleted: true },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User account soft-deleted successfully",
    data: null,
  });
});

// ──────────────────────────────────────────────────────────
// 3. COURSE MANAGEMENT
// ──────────────────────────────────────────────────────────

// GET /api/admin/courses
const getAdminCourses = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search?.trim()) {
    filter.title = new RegExp(req.query.search.trim(), "i");
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.instructor) {
    filter.instructor = req.query.instructor;
  }

  const [courses, totalCourses] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName email avatar")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCourses / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: courses.length,
    data: {
      courses,
      pagination: {
        currentPage: page,
        limit,
        totalCourses,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// GET /api/admin/courses/:id
const getAdminCourseById = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "firstName lastName email avatar")
    .populate("category", "name slug");

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const [studentsCount, revenueData, reviewsCount] = await Promise.all([
    Enrollment.countDocuments({ course: course._id }),
    Payment.aggregate([
      { $match: { course: course._id, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),
    Review.countDocuments({ course: course._id }),
  ]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course,
      statistics: {
        studentsCount,
        revenue: revenueData[0]?.total || 0,
        reviewsCount,
      },
    },
  });
});

// PATCH /api/admin/courses/:id/status
const updateAdminCourseStatus = asyncWrapper(async (req, res, next) => {
  const { status } = req.body;

  if (!["draft", "published", "archived"].includes(status)) {
    return next(
      new AppError(
        "Status must be 'draft', 'published', or 'archived'",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  course.status = status;
  await course.save();

  await logActivity({
    type: "course_status_change",
    user: req.user._id,
    message: `Admin ${req.user.firstName} updated course status "${course.title}" to ${status}`,
    metadata: { courseId: course._id, status },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: `Course status updated to ${status}`,
    data: { course },
  });
});

// DELETE /api/admin/courses/:id
const deleteAdminCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const publicIds = [
    course.coverImage?.publicId,
    ...(course.gallery || []).map((img) => img.publicId),
  ].filter(Boolean);

  await course.deleteOne();

  await Promise.all(publicIds.map((pId) => deleteCloudinaryImage(pId)));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course deleted successfully",
    data: null,
  });
});

// ──────────────────────────────────────────────────────────
// 4. INSTRUCTOR MANAGEMENT
// ──────────────────────────────────────────────────────────

// GET /api/admin/instructors
const getAdminInstructors = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { role: "instructor" };

  if (req.query.search?.trim()) {
    const regex = new RegExp(req.query.search.trim(), "i");
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }

  if (req.query.isVerified !== undefined) {
    filter.isInstructorVerified = req.query.isVerified === "true";
  }

  const [instructors, totalInstructors] = await Promise.all([
    User.find(filter)
      .select("-passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const instructorIds = instructors.map((i) => i._id);

  const [coursesStats, revenueStats] = await Promise.all([
    Course.aggregate([
      { $match: { instructor: { $in: instructorIds } } },
      { $group: { _id: "$instructor", courseCount: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: "$courseDoc" },
      { $match: { "courseDoc.instructor": { $in: instructorIds } } },
      {
        $group: {
          _id: "$courseDoc.instructor",
          totalEarnings: { $sum: "$finalAmount" },
          salesCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const coursesMap = new Map(
    coursesStats.map((c) => [c._id.toString(), c.courseCount])
  );
  const revenueMap = new Map(
    revenueStats.map((r) => [
      r._id.toString(),
      { totalEarnings: r.totalEarnings, salesCount: r.salesCount },
    ])
  );

  const enrichedInstructors = instructors.map((inst) => {
    const instObj = inst.toSafeObject();
    const rev = revenueMap.get(inst._id.toString()) || {
      totalEarnings: 0,
      salesCount: 0,
    };
    return {
      ...instObj,
      coursesCount: coursesMap.get(inst._id.toString()) || 0,
      totalEarnings: rev.totalEarnings,
      salesCount: rev.salesCount,
    };
  });

  const totalPages = Math.ceil(totalInstructors / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: enrichedInstructors.length,
    data: {
      instructors: enrichedInstructors,
      pagination: {
        currentPage: page,
        limit,
        totalInstructors,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// PATCH /api/admin/instructors/:id/verify
const verifyAdminInstructor = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  if (user.role !== "instructor") {
    return next(
      new AppError(
        "Target user is not an instructor",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const isVerified =
    req.body.isVerified !== undefined
      ? Boolean(req.body.isVerified)
      : !user.isInstructorVerified;

  user.isInstructorVerified = isVerified;
  if (isVerified) {
    user.instructorStatus = "approved";
  }
  await user.save();

  await logActivity({
    type: "instructor_verified",
    user: req.user._id,
    message: `Admin ${req.user.firstName} ${
      isVerified ? "verified" : "unverified"
    } instructor ${user.email}`,
    metadata: { instructorId: user._id, isVerified },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: `Instructor ${isVerified ? "verified" : "unverified"} successfully`,
    data: { user: user.toSafeObject() },
  });
});

// GET /api/admin/instructors/requests
const getInstructorRequests = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    instructorStatus: "pending",
    isDeleted: false,
  };

  const [requests, totalRequests] = await Promise.all([
    User.find(filter)
      .select("-passwordResetToken -passwordResetExpires")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRequests / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: requests.length,
    data: {
      requests,
      pagination: {
        currentPage: page,
        limit,
        totalRequests,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// PATCH /api/admin/instructors/:id/approve
const approveInstructorRequest = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  user.role = "instructor";
  user.instructorStatus = "approved";
  user.isInstructorVerified = true;
  await user.save();

  await logActivity({
    type: "instructor_verified",
    user: req.user._id,
    message: `Admin ${req.user.firstName} approved instructor request for ${user.email}`,
    metadata: { instructorId: user._id, status: "approved" },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Instructor request approved successfully",
    data: { user: user.toSafeObject() },
  });
});

// PATCH /api/admin/instructors/:id/reject
const rejectInstructorRequest = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  user.role = "user";
  user.instructorStatus = "rejected";
  user.isInstructorVerified = false;
  await user.save();

  await logActivity({
    type: "instructor_verified",
    user: req.user._id,
    message: `Admin ${req.user.firstName} rejected instructor request for ${user.email}`,
    metadata: { instructorId: user._id, status: "rejected" },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Instructor request rejected successfully",
    data: { user: user.toSafeObject() },
  });
});

// ──────────────────────────────────────────────────────────
// 5. PAYMENT MANAGEMENT
// ──────────────────────────────────────────────────────────

// GET /api/admin/payments?status=paid&page=1&limit=10
const getAdminPayments = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [payments, totalPayments] = await Promise.all([
    Payment.find(filter)
      .populate("user", "firstName lastName email avatar")
      .populate("course", "title price coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPayments / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: payments.length,
    data: {
      payments,
      pagination: {
        currentPage: page,
        limit,
        totalPayments,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// GET /api/admin/payments/:id
const getAdminPaymentById = asyncWrapper(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate("user", "firstName lastName email avatar role")
    .populate("course", "title price coverImage instructor")
    .populate("coupon", "code discountType discountValue");

  if (!payment) {
    return next(new AppError("Payment not found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { payment },
  });
});

// PATCH /api/admin/payments/:id/refund
const refundAdminPayment = asyncWrapper(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError("Payment not found", 404, httpStatusText.FAIL));
  }

  payment.status = "failed"; // Mark as failed / refunded
  await payment.save();

  await Enrollment.findOneAndDelete({
    user: payment.user,
    course: payment.course,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Payment refunded and enrollment removed successfully",
    data: { payment },
  });
});

// ──────────────────────────────────────────────────────────
// 6. REVIEWS MODERATION
// ──────────────────────────────────────────────────────────

// GET /api/admin/reviews?page=1&limit=10
const getAdminReviews = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.rating) {
    filter.rating = Number(req.query.rating);
  }

  if (req.query.course) {
    filter.course = req.query.course;
  }

  const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("user", "firstName lastName avatar email")
      .populate("course", "title coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: reviews.length,
    data: {
      reviews,
      pagination: {
        currentPage: page,
        limit,
        totalReviews,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// DELETE /api/admin/reviews/:id
const deleteAdminReview = asyncWrapper(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404, httpStatusText.FAIL));
  }

  const courseId = review.course;
  await review.deleteOne();

  // Recalculate Course Rating
  const stats = await Review.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: "$course",
        ratingsCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Number(stats[0].averageRating.toFixed(1)),
      ratingsCount: stats[0].ratingsCount,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      ratingsCount: 0,
    });
  }

  await logActivity({
    type: "review_deleted",
    user: req.user._id,
    message: `Admin ${req.user.firstName} deleted review ID ${req.params.id}`,
    metadata: { reviewId: req.params.id, courseId },
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review deleted and course ratings recalculated successfully",
    data: null,
  });
});

// ──────────────────────────────────────────────────────────
// 7. RECENT ACTIVITY FEED
// ──────────────────────────────────────────────────────────

// GET /api/admin/activity?page=1&limit=20
const getAdminActivity = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [activities, totalActivities] = await Promise.all([
    Activity.find()
      .populate("user", "firstName lastName email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalActivities / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: activities.length,
    data: {
      activities,
      pagination: {
        currentPage: page,
        limit,
        totalActivities,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// ──────────────────────────────────────────────────────────
// 8. REPORT EXPORTS (CSV / JSON)
// ──────────────────────────────────────────────────────────

// GET /api/admin/export/users?format=csv
const exportAdminUsers = asyncWrapper(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";

  const users = await User.find()
    .select("-passwordResetToken -passwordResetExpires")
    .sort({ createdAt: -1 });

  if (format === "csv") {
    const fields = [
      { label: "User ID", key: "_id" },
      { label: "First Name", key: "firstName" },
      { label: "Last Name", key: "lastName" },
      { label: "Email", key: "email" },
      { label: "Role", key: "role" },
      { label: "Active", key: "isActive" },
      { label: "Verified Instructor", key: "isInstructorVerified" },
      { label: "Registered At", key: "createdAt" },
    ];

    const csvData = jsonToCsv(
      users.map((u) => u.toObject()),
      fields
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users-report.csv"'
    );
    return res.status(200).send(csvData);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: users.length,
    data: { users },
  });
});

// GET /api/admin/export/revenue?format=csv
const exportAdminRevenue = asyncWrapper(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";

  const payments = await Payment.find({ status: "paid" })
    .populate("user", "firstName lastName email")
    .populate("course", "title")
    .sort({ paidAt: -1 });

  if (format === "csv") {
    const flatPayments = payments.map((p) => ({
      paymentId: p._id,
      userEmail: p.user?.email || "N/A",
      userName: p.user ? `${p.user.firstName} ${p.user.lastName}` : "N/A",
      courseTitle: p.course?.title || "N/A",
      amount: p.amount,
      discount: p.discount,
      finalAmount: p.finalAmount,
      currency: p.currency,
      provider: p.provider,
      paidAt: p.paidAt,
    }));

    const fields = [
      { label: "Payment ID", key: "paymentId" },
      { label: "User Name", key: "userName" },
      { label: "User Email", key: "userEmail" },
      { label: "Course Title", key: "courseTitle" },
      { label: "Original Amount", key: "amount" },
      { label: "Discount", key: "discount" },
      { label: "Final Amount Paid", key: "finalAmount" },
      { label: "Currency", key: "currency" },
      { label: "Provider", key: "provider" },
      { label: "Paid At", key: "paidAt" },
    ];

    const csvData = jsonToCsv(flatPayments, fields);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="revenue-report.csv"'
    );
    return res.status(200).send(csvData);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: payments.length,
    data: { payments },
  });
});

// GET /api/admin/export/courses?format=csv
const exportAdminCourses = asyncWrapper(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";

  const courses = await Course.find()
    .populate("instructor", "firstName lastName email")
    .populate("category", "name")
    .sort({ createdAt: -1 });

  if (format === "csv") {
    const flatCourses = courses.map((c) => ({
      courseId: c._id,
      title: c.title,
      category: c.category?.name || "N/A",
      instructor: c.instructor
        ? `${c.instructor.firstName} ${c.instructor.lastName}`
        : "N/A",
      price: c.price,
      status: c.status,
      averageRating: c.averageRating,
      ratingsCount: c.ratingsCount,
      createdAt: c.createdAt,
    }));

    const fields = [
      { label: "Course ID", key: "courseId" },
      { label: "Title", key: "title" },
      { label: "Category", key: "category" },
      { label: "Instructor", key: "instructor" },
      { label: "Price", key: "price" },
      { label: "Status", key: "status" },
      { label: "Average Rating", key: "averageRating" },
      { label: "Total Ratings", key: "ratingsCount" },
      { label: "Created At", key: "createdAt" },
    ];

    const csvData = jsonToCsv(flatCourses, fields);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="courses-report.csv"'
    );
    return res.status(200).send(csvData);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: courses.length,
    data: { courses },
  });
});

module.exports = {
  getAdminDashboard,
  getAdminRevenueChart,
  getAdminEnrollmentChart,
  getAdminUserGrowthChart,
  getAdminTopCourses,
  getAdminTopInstructors,

  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
  deleteAdminUser,

  getAdminCourses,
  getAdminCourseById,
  updateAdminCourseStatus,
  deleteAdminCourse,

  getAdminInstructors,
  verifyAdminInstructor,
  getInstructorRequests,
  approveInstructorRequest,
  rejectInstructorRequest,

  getAdminPayments,
  getAdminPaymentById,
  refundAdminPayment,

  getAdminReviews,
  deleteAdminReview,

  getAdminActivity,

  exportAdminUsers,
  exportAdminRevenue,
  exportAdminCourses,
};
