import multer from "multer";
const storage = multer.diskStorage({});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype !== "image/jpeg" || file.mimetype !== "image/png")
      return callback(new Error("Only images are allowed"));

    callback(null, true);
  },
}).single("profileImage");

export default upload;
