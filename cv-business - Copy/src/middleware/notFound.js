const Response = require('../utils/response');

const notFound = (req, res, next) => {
  return Response.error(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = notFound;
