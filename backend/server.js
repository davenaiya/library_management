require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
connectDB();

const defaultClientOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
].filter(Boolean);

const allowedOrigins = new Set(
  defaultClientOrigins.flatMap((origin) => String(origin).split(",").map((item) => item.trim()))
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    try {
      const { hostname } = new URL(origin);
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        callback(null, true);
        return;
      }
    } catch (error) {
      // Fall through to explicit rejection below.
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));
