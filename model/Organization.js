import mongoose from "mongoose";
import slugify from "slugify";

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please add a name"],
  },
  slug: String,
  email: {
    type: String,
    required: [true, "Please add a email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    unique: true,
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please privode a valid URL with HTTP or HTTPS",
    ],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    match: [
      /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/,
      "Please add a valid phone number",
    ],
    maxlength: [10, "Phone number cannot be longer than 10 character"],
  },
  address: {
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    ward: {
      type: String,
      required: [true, "Please add a ward"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    municipality: {
      type: String,
      required: [true, "Please add a municipality"],
    },
  },
  facility: {
    type: [String],
    required: [true, "Please add facilities"],
  },
  logo: {
    type: String,
    default: "default.png",
  },
  ceo: {
    type: String,
    required: [true, "Please add a ceo name"],
  },
  establishedAt: {
    type: Date,
    required: [true, "Please add a established date"],
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});
OrganizationSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  console.log("Slugify run", this.slug);

  next();
});

export default mongoose.model("Organization", OrganizationSchema);
