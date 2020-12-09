import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: [true, "Please add a a refreshToken"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Token", TokenSchema);
