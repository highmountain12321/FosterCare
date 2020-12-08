import mongoose from "mongoose";

const FosterSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please add a firstName"],
    trim: true,
  },
  middleName: {
    type: String,
    default: "no-middleName",
  },
  lastName: {
    type: String,
    required: [true, "Please add a lastName"],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, "Please add a gender"],
  },
  photo: {
    type: String,
    default: "no-photo.jpeg",
  },
  dobBS: {
    type: Date,
    required: [true, "Please add a date of birth"],
    match: [/^\d{2}([./-])\d{2}\1\d{4}$/, "Please add a valid date of birth"],
  },
  reasonHere: {
    type: String,
    required: [true, "Please add a reason to be here"],
  },
  adobted: {
    type: Boolean,
    default: false,
  },
  adobtedAt: {
    type: Date,
  },
  familyId: {
    type: mongoose.Schema.ObjectId,
    ref: "Family",
  },
  organizationId: {
    type: mongoose.Schema.ObjectId,
    ref: "Organization",
    required: true,
  },
  caretakerId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Foster", FosterSchema);
