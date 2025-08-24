const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const helper = require("./helper");

class AuthMiddleware {
  async user(req, res, next) {
    try {
      let token = req.headers["x-access-token"] || req.headers["authorization"];

      if (!token) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Authentication token is missing.",
          })
        );
      }

      if (token.startsWith("Bearer ")) {
        // Remove 'Bearer ' from the token string
        token = token.slice(7, token.length);
      } else {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Unauthorized.",
          })
        );
      }

      // Verify the token and attach the user to the request
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
        if (err) {
          return res.status(401).json(
            helper.responseHandler({
              status: 401,
              error: "Unauthorized.",
            })
          );
        } else {
          // Attach the decoded user payload to the request object
          req.user = decodedUser;
          next();
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: "An internal server error occurred.",
        })
      );
    }
  }
}

module.exports = new AuthMiddleware();
