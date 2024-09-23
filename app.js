const express = require("express");
// const feedRoutes = require("./routes/feed");
// const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const {createHandler} = require("graphql-http/lib/use/express");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");

dotenv.config();

const app = express();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
    // cb(
    //   null,
    //   `${new Date().toISOString().split(":").join("")}-${file.originalname}`
    // );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/graphql", createHandler({
schema : graphqlSchema,
rootValue : graphqlResolver
}))
// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);
// app.use((error, req, res, next) => {
//   const status = error.statusCode || 500;
//   const message = error.message;
//   const data = error.data;
//   res.status(status).json({ message: message, data: data });
// });

mongoose
  .connect(process.env.NODE_APP_MONGODB_URI_KEY)
  .then((result) => {
    app.listen(8080);
    console.log("Client Connected!");
    // const server = app.listen(8080);
    // const io = require("./socket").init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client Connected!");
    // });
  })
  .catch((err) => console.log(err));
