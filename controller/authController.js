import crypto from "crypto";
import createError from "../utils/createError";
import resetPasswordEmail from "../utils/resetPasswordEmail";
import upload from "../utils/upload";
import asyncHandler from "../middleware/asyncHandler";
import User from "../models/User";
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
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      cloudinary.v2.uploader.upload(
        req.file.path,
        { use_filename: true, folder: "userProfile" },
        async function (error, result) {
          if (error) throw createError(409, `failed to create product`);
          await User.findByIdAndUpdate(req.user._id, {
            photo: result.url,
          });

          res
            .status(200)
            .send({ status: "Success", message: "Profile photo updated" });
        }
      );
    }
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
      message: "ResetPassword token is sent to your emails",
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

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.genAuthToken();

  res.status(statusCode).send({ status: "Success", token });
};
export {
  RegisterUser,
  login,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateProfilePhoto,
};
