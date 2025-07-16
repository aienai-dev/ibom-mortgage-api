const dotevn = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const db = require("./db/connection");
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/users.route");

dotevn.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cors());
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

app.use("/auth", authRoute);
app.use("/users", usersRoute);

db.connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log("listening for requests");
    });
  })
  .catch((err) => console.log("Database connection failed"));
