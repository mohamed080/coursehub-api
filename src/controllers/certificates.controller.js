const Certificate = require("../models/certificate.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const User = require("../models/user.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getPagination = require("../helpers/pagination.helper");

const {
  generateUniqueVerificationCode,
  populateCertificate,
} = require("../helpers/certificate.helper");

//  @access  Authenticated student
const generateCertificate = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (!enrollment) {
    return next(
      new AppError(
        "You must be enrolled in this course",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  if (enrollment.status !== "completed" || enrollment.progress !== 100) {
    return next(
      new AppError(
        "You must complete the course before generating a certificate",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingCertificate = await Certificate.findOne({
    user: req.user._id,
    course: course._id,
  });

  if (existingCertificate) {
    await populateCertificate(existingCertificate);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Certificate has already been generated",
      data: {
        certificate: existingCertificate,
      },
    });
  }

  const verificationCode = await generateUniqueVerificationCode();

  const certificate = await Certificate.create({
    user: req.user._id,
    course: course._id,
    enrollment: enrollment._id,
    verificationCode,
  });

  await populateCertificate(certificate);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Certificate generated successfully",
    data: {
      certificate,
    },
  });
});

// access  Authenticated
const getMyCertificates = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    user: req.user._id,
  };

  if (req.query.isValid !== undefined) {
    filter.isValid = req.query.isValid === "true";
  }

  let courseIds;

  if (req.query.search?.trim()) {
    const courses = await Course.find({
      title: {
        $regex: req.query.search.trim(),
        $options: "i",
      },
    })
      .select("_id")
      .lean();

    courseIds = courses.map((course) => course._id);

    filter.course = {
      $in: courseIds,
    };
  }

  const [certificates, totalCertificates] = await Promise.all([
    Certificate.find(filter)
      .populate({
        path: "course",
        select: "title coverImage instructor category",
        populate: [
          {
            path: "instructor",
            select: "firstName lastName avatar",
          },
          {
            path: "category",
            select: "name slug",
          },
        ],
      })
      .populate("enrollment", "status progress completedAt")
      .sort({
        issuedAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Certificate.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCertificates / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: certificates.length,
    data: {
      certificates,
      pagination: {
        currentPage: page,
        limit,
        totalCertificates,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

//  access  Certificate owner or admin
const getCertificateById = asyncWrapper(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.certificateId);

  if (!certificate) {
    return next(
      new AppError("Certificate not found", 404, httpStatusText.FAIL),
    );
  }

  const isOwner = certificate.user.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(
      new AppError(
        "You do not have permission to view this certificate",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  await populateCertificate(certificate);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      certificate,
    },
  });
});

// access  Public
const verifyCertificate = asyncWrapper(async (req, res, next) => {
  const verificationCode = req.params.verificationCode.toUpperCase();

  const certificate = await Certificate.findOne({
    verificationCode,
  })
    .populate("user", "firstName lastName avatar")
    .populate({
      path: "course",
      select: "title instructor category",
      populate: [
        {
          path: "instructor",
          select: "firstName lastName",
        },
        {
          path: "category",
          select: "name slug",
        },
      ],
    });

  if (!certificate) {
    return next(
      new AppError(
        "Certificate not found or verification code is invalid",
        404,
        httpStatusText.FAIL,
      ),
    );
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: certificate.isValid
      ? "Certificate is valid"
      : "Certificate has been revoked",
    data: {
      isValid: certificate.isValid,

      certificate: {
        _id: certificate._id,
        verificationCode: certificate.verificationCode,
        issuedAt: certificate.issuedAt,
        revokedAt: certificate.revokedAt,
        revokedReason: certificate.revokedReason,

        student: certificate.user,

        course: certificate.course,
      },
    },
  });
});

// access  Admin
const getAllCertificates = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};

  if (req.query.isValid !== undefined) {
    filter.isValid = req.query.isValid === "true";
  }

  if (req.query.user) {
    filter.user = req.query.user;
  }

  if (req.query.course) {
    filter.course = req.query.course;
  }

  if (req.query.search?.trim()) {
    const searchValue = req.query.search.trim();

    const users = await User.find({
      $or: [
        {
          firstName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ],
    })
      .select("_id")
      .lean();

    const courses = await Course.find({
      title: {
        $regex: searchValue,
        $options: "i",
      },
    })
      .select("_id")
      .lean();

    filter.$or = [
      {
        user: {
          $in: users.map((user) => user._id),
        },
      },
      {
        course: {
          $in: courses.map((course) => course._id),
        },
      },
      {
        verificationCode: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  const [certificates, totalCertificates] = await Promise.all([
    Certificate.find(filter)
      .populate("user", "firstName lastName email avatar")
      .populate("course", "title coverImage")
      .sort({
        issuedAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Certificate.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCertificates / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: certificates.length,
    data: {
      certificates,
      pagination: {
        currentPage: page,
        limit,
        totalCertificates,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

// access  Admin
const revokeCertificate = asyncWrapper(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.certificateId);

  if (!certificate) {
    return next(
      new AppError("Certificate not found", 404, httpStatusText.FAIL),
    );
  }

  if (!certificate.isValid) {
    return next(
      new AppError("Certificate is already revoked", 409, httpStatusText.FAIL),
    );
  }

  certificate.isValid = false;
  certificate.revokedAt = new Date();
  certificate.revokedReason = req.body.reason;

  await certificate.save();

  await populateCertificate(certificate);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Certificate revoked successfully",
    data: {
      certificate,
    },
  });
});

// access  Admin
const restoreCertificate = asyncWrapper(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.certificateId);

  if (!certificate) {
    return next(
      new AppError("Certificate not found", 404, httpStatusText.FAIL),
    );
  }

  if (certificate.isValid) {
    return next(
      new AppError("Certificate is already valid", 409, httpStatusText.FAIL),
    );
  }

  certificate.isValid = true;
  certificate.revokedAt = null;
  certificate.revokedReason = null;

  await certificate.save();

  await populateCertificate(certificate);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Certificate restored successfully",
    data: {
      certificate,
    },
  });
});

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getAllCertificates,
  revokeCertificate,
  restoreCertificate,
};
