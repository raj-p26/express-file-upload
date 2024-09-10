const express = require("express");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const mysql = require("mysql");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.folderUuid) {
      req.folderUuid = uuid();
    }
    const uuidPath = `uploads/${req.folderUuid}`;
    fs.mkdirSync(uuidPath, { recursive: true });

    cb(null, uuidPath);
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
app.use("/", express.static("public"));

app.post(
  "/upload",
  upload.fields([{ name: "file1" }, { name: "file2" }, { name: "file3" }]),
  function (req, res) {
    if (!req.files) {
      return res.status(400).json({ message: "ain't no files provided" });
    }

    const conn = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "test",
    });

    const filePaths = {};

    for (const fieldName in req.files) {
      const file = req.files[fieldName][0];
      filePaths[fieldName] = file.path;
    }

    conn.createQuery(
      "INSERT INTO upload_files (file1, file2, file3) VALUES (?, ?, ?);",
      [filePaths["file1"], filePaths["file2"], filePaths["file3"]],
      function (errors, results, fields) {
        console.log(errors);
        console.log(results);
        console.log(fields);
      }
    );

    conn.end();

    return res.json({
      message: "success",
      filePaths,
    });
  }
);

app.listen(4000, () => console.log("listening on 4000"));
