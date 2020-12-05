import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add a email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    unique: true,
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  photo: {
    type: String,
    default: "no-photo.jpeg",
  },
  password: {
    type: String,
    minlength: [8, "Password should be 8 character long"],
    required: [true, "Please add a password"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Password sholud be at lest one digit, one lower and upper case ,one spcial charcter like @%!&^*",
    ],
    select: false,
  },
  role: {
    type: String,
    enum: ["staff", "admin", "superadmin"],
    default: "staff",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const SaltFactor = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, SaltFactor);

  next();
});

UserSchema.methods.genAuthToken = function () {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIREIN,
    }
  );
};
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash the resetToken and set it to this.resetPasswordToken

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", UserSchema);
