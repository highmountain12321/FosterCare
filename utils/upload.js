import multer from "multer";
const storage = multer.diskStorage({});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const imageFormat = ["image/jpeg", "image/png"];

    if (!imageFormat.includes(file.mimetype)) {
      return callback(new Error("Only images are allowed"));
    }

    callback(null, true);
  },
}).single("profileImage");

export default upload;
