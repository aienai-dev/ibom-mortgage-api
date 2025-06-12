const Users = require("../models/user.model");
const jwt = require("jsonwebtoken");
const helper = require("./helper");

const auth = {
  user: async (req, res, next) => {
    try {
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      if (!token) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: ``,
          })
        );
      }
      if (token.includes(`Bearer `)) {
        token = token.slice(7, token.length);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).json(
              helper.responseHandler({
                status: 401,
                error: ``,
              })
            );
          } else {
            req.token = token;
            next();
          }
        });
      } else {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: ``,
          })
        );
      }
    } catch (err) {
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
};

module.exports = auth;
