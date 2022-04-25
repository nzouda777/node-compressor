const express = require("express");
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const imagemin = require('imagemin')
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");

const app = express();
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

app.set("view engine", "ejs");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", upload.single("image"), (req, res, next) => {
  const file = req.file;
  var ext;

  if (!file) {
    const error = new Error("upload a fucking file please :(");
    error.httpStatusCode = 404;
    return next(error);
  }
  if (file.mimetype == "image/jpeg") {
    ext = "jpg";
  }
  if (file.mimetype == "image/png") {
    ext = "png";
    }
    console.log(file.path)

  res.render("image", { url: file.path, name: file.filename, ext: ext });
});

app.post("/compress/uploads/:name/:ext", async (req, res) => {
  const files = await imagemin(["uploads/" + req.params.name], {
    destination: "output",
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.4, 0.6],
        speed: 11
      })
    ]
  });

    res.download(files[0].destinationPath);
});

app.listen(1300, () => {
  console.log("Server is listening on port 1300");
});
