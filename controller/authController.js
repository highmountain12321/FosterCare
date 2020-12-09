import crypto from "crypto";
import createError from "../utils/createError";
import resetPasswordEmail from "../utils/resetPasswordEmail";
import UploadImage from "../utils/upload";
import asyncHandler from "../middleware/asyncHandler";
import jwt_decode from "jwt-decode";
import User from "../models/User";
import Token from "../models/Token";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const RegisterUser = asyncHandler(async (req, res, next) => {
  await User.create(req.body);

  res.status(200).send({ status: "Success", message: "User registered" });
});

const login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  }).select("+password");

  if (!user) throw createError(401, `Email doesn't match`);

  const isPassword = await user.matchPassword(req.body.password);
  if (!isPassword) throw createError(401, `Password doesn't match`);

  sendTokenResponse(user, 200, res);
});

const getAuthDetails = asyncHandler(async (req, res, next) => {
  const findUser = await User.findById(req.user._id);

  res.status(200).send({ status: "success", payload: findUser });
});

//Update user details
const updateDetails = asyncHandler(async (req, res, next) => {
  const newDetails = {
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.user._id, newDetails, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .send({ status: "success", message: "User updated successfully" });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  //compare currentPassword

  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch)
    throw createError(
      400,
      `Current password ${req.body.currentPassword} does't match`
    );

  user.password = req.body.newPassword;

  await user.save();
  res
    .status(200)
    .send({ status: "success", message: "Password updated successfully" });
});

const updateProfilePhoto = asyncHandler(async (req, res, next) => {
  UploadImage(req, res, async (err) => {
    if (err) return res.status(400).send(err);

    cloudinary.v2.uploader.upload(
      req.file.path,
      { folder: "avatar" },
      async function (error, result) {
        if (error) throw createError(409, `failed to update profile image`);

        await User.findByIdAndUpdate(
          req.user._id,
          {
            photo: result.url,
          },
          {
            new: true,
            runValidators: true,
          }
        );

        res
          .status(200)
          .send({ status: "Success", message: "Profile photo updated" });
      }
    );
  });
});

//Forgot Password

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw createError(400, `User with email ${req.body.email} is not found`);

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `https://fostercare.herokuapp.com/resetPassword/?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else ) has
      requested the reset of a password.`;

    const options = {
      email: user.email,
      subject: "Password reset token",
      message,
      url: resetUrl,
    };

    await resetPasswordEmail(options);

    res.status(200).send({
      status: "success",
      message: "ResetPassword token is sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw createError(500, "Email cound't be sent");
  }
});

//ResetPassword

const resetPassword = asyncHandler(async (req, res, next) => {
  //Hash the resetToken

  const resetToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw createError(400, `Invalid token ${req.body.token}`);

  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .send({ status: "success", message: "Your Password has beed changed" });
});

const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.genAuthToken();
  const refreshToken = user.genRefreshToken();

  await Token.create({
    refreshToken: refreshToken,
  });

  res.status(statusCode).send({ status: "Success", token, refreshToken });
};

const sendRefreshToken = asyncHandler(async (req, res, next) => {
  if (!req.body.token) throw createError(404, "Token not found");

  const decodeToken = jwt_decode(req.body.token);

  if (new Date(decodeToken.exp * 1000) >= new Date())
    throw createError(400, "Token is not expired yet");

  const isRefreshTokenExit = await Token.findOne({
    refreshToken: req.body.refreshToken,
  });

  if (!isRefreshTokenExit) throw createError(404, "Invalid refreshToken");

  const user = await User.findById(decodeToken._id);

  if (!user) throw createError(404, `User not found`);

  const newAccessToken = user.genAuthToken();
  const newRefreshToken = user.genRefreshToken();

  await Token.findByIdAndUpdate(isRefreshTokenExit._id, {
    refreshToken: newRefreshToken,
  });

  res.status(200).send({
    status: "Success",
    token: newAccessToken,
    refreshToken: newRefreshToken,
    decodeToken,
  });
});

const logout = asyncHandler(async (req, res, next) => {
  const isRefreshTokenExit = await Token.findOne({
    refreshToken: req.body.refreshToken,
  });

  if (!isRefreshTokenExit) throw createError(404, "Invalid refreshToken");

  await Token.findByIdAndDelete(isRefreshTokenExit._id);

  res.status(200).send({
    status: "Success",
    message: "Logout Success",
  });
});

export {
  RegisterUser,
  login,
  getAuthDetails,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateProfilePhoto,
  sendRefreshToken,
  logout,
};
