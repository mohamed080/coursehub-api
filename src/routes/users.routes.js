const express = require("express");

const usersController = require("../controllers/users.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const uploadImage = require("../middleware/upload.middleware");

const router = express.Router();

/*
 * Every route below this line requires authentication.
 */
router.use(protect);

/*
 * Current user routes.
 */

router.patch("/me", usersController.updateMyProfile);

router.patch("/me/password", usersController.updateMyPassword);

router.delete("/me", usersController.deactivateMyAccount);

router.post("/me/request-instructor", usersController.requestInstructorStatus);

router.patch(
  "/me/avatar",
  uploadImage.single("avatar"),
  usersController.updateMyAvatar,
);

router.delete("/me/avatar", usersController.deleteMyAvatar);

/*
 * Every route below this line requires admin role.
 */

router.use(authorize("admin"));

router.get("/", usersController.getAllUsers);

router.get("/:userId", usersController.getUserById);

router.patch("/:userId/role", usersController.updateUserRole);

router.delete("/:userId", usersController.deleteUser);

module.exports = router;
