import mongoose from "mongoose";

const FamilySchema = new mongoose.Schema(
  {
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
    email: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please add a phone number"],
      match: [
        /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/,
        "Please add a valid phone number",
      ],
      maxlength: [10, "Phone number cannot be longer than 10 character"],
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

FamilySchema.virtual("adobtedFosters", {
  ref: "Foster",
  localField: "_id",
  foreignField: "familyId",
  justOne: false,
});

export default mongoose.model("Family", FamilySchema);
