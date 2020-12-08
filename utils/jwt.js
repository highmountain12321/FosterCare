import jwt from "jsonwebtoken";
import createError from "./createError";

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError")
      throw createError(401, "Token is expired. Please Login");

    throw error;
  }
};

export default verifyToken;
