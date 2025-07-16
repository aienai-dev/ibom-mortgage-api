// const dotevn = require("dotenv");
// const cors = require("cors");
// const morgan = require("morgan");
// const express = require("express");
// const db = require("./db/connection");
// const authRoute = require("./routes/auth.route");
// const usersRoute = require("./routes/users.route");

// dotevn.config();

// const PORT = process.env.PORT || 3000;

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(morgan("tiny"));
// app.disable("x-powered-by");

// const corsOptions = {
//   origin: "*",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept",
//   optionsSuccessStatus: 200,
// };

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
//   );
//   if (req.method === "OPTIONS") {
//     res.setHeader(
//       "Access-Control-Allow-hEADER",
//       "PUT, POST, PATCH, GET, DELETE,"
//     );
//     return res.status(200).json({});
//   }

//   next();
// });

// app.use("/auth", authRoute);
// app.use("/users", usersRoute);

// db.connection()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log("listening for requests");
//     });
//   })
//   .catch((err) => console.log("Database connection failed"));
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const db = require("./db/connection");
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/users.route");

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// Wide-open CORS configuration (use cautiously)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Middleware
app.use(express.json());
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
