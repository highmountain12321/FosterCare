import {
  RegisterUser,
  login,
  updateDetails,
  updatePassword,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
} from "../controller/authController";
import { protect } from "../middleware/auth";
import { permission } from "../middleware/auth";

const router = require("express").Router();

router.route("/register").post(protect, permission("superadmin"), RegisterUser);
router.route("/login").post(login);
router
  .route("/update/userDetails")
  .put(protect, permission("superadmin"), updateDetails);
router.route("/update/password").put(protect, updatePassword);
router.route("/update/profilePhoto").put(protect, updateProfilePhoto);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);

export default router;
