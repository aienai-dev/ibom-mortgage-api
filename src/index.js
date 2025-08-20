const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const db = require("./db/connection");
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/users.route");

dotenv.config();

const PORT = process.env.PORT || 3010;

const app = express();

app.use(express.json());

const allowedOrigins = [
  "https://profiling.ibommortgagebank.com",
  "https://profiling.ibommortgagebank.com/",
  // "https://yourotherdomain.com",
  "http://localhost:3000", // For local development
  "http://localhost:3001", // For Vite/React development
  "http://localhost:3002", // For Vite/React development
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true, // Enable if you need cookies/authentication
  optionsSuccessStatus: 200, // For legacy browser support
};

// Wide-open CORS configuration (use cautiously)
app.use(cors(corsOptions));

app.use(morgan("tiny"));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-hEADER",
      "PUT, POST, PATCH, GET, DELETE,"
    );
    return res.status(200).json({});
  }

  next();
});

// Routes
app.use("/auth", authRoute);
app.use("/users", usersRoute);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "Server running" });
});

// Database connection and server start
db.connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
