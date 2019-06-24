const { clearHash } = require("../services/cache");

const cleanCash = async (req, res, next) => {
  await next();
  return clearHash(req.user.id);
};

module.exports = cleanCash;
