const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSecretToken = config.get("jwtSecretToken");

module.exports = function (req, res, next) {
  //Get token from header

  const token = req.header("x-auth-token");

  //check if no token

  if (!token) {
    res.status(401).send({ msg: "No token, Authorization Denied" });
  }

  //Verify token

  try {
    const decoded = jwt.verify(token, jwtSecretToken);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).send({ msg: "Token not valid" });
  }
};
