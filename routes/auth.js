import {
  RegisterUser,
  login,
  getAuthDetails,
  updateDetails,
  updatePassword,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  sendRefreshToken,
  logout,
} from "../controller/authController";
import { protect, permission } from "../middleware/auth";

const router = require("express").Router();

router.route("/register").post(protect, permission("superadmin"), RegisterUser);
router.route("/login").post(login);
router
  .route("/update/userDetails")
  .put(protect, permission("superadmin"), updateDetails);
router.route("/getAuthDetails").get(protect, getAuthDetails);
router.route("/update/password").put(protect, updatePassword);
router.route("/update/profilePhoto").put(protect, updateProfilePhoto);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/refreshToken").get(sendRefreshToken);
router.route("/logout").get(logout);

export default router;
