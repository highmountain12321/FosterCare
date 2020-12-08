import createError from "../utils/createError";
import verifyToken from "../utils/jwt";
import asyncHandler from "../middleware/asyncHandler";
import User from "../models/User";

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!(authorization && authorization.toLowerCase().startsWith("bearer")))
    throw createError(401, "Not authorized");

  const token = authorization.split(" ")[1];

  const decodeToken = verifyToken(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodeToken._id);

  next();
});

const permission = (...roles) => (req, res, next) => {
  console.log(roles);
  if (!roles.includes(req.user.role))
    throw createError(
      401,
      `User role ${req.user.role} is not allowed to access this resource`
    );

  next();
};
export { protect, permission };
