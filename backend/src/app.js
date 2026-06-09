const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://10.138.59.183:5173",
  "http://192.168.1.49:5173",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ success: true, data: null, message: "Asla Council API" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "غير موجود" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === "نوع الملف غير مدعوم") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "حجم الملف أكبر من المسموح" });
  }
  res.status(500).json({ success: false, message: "حدث خطأ في الخادم" });
});

module.exports = app;
