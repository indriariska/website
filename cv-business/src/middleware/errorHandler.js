const Response = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return Response.error(res, 'A record with this value already exists', 409);
    }
    if (err.code === 'P2025') {
      return Response.error(res, 'Record not found', 404);
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return Response.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return Response.error(res, 'Token expired', 401);
  }

  if (err.name === 'ValidationError') {
    return Response.error(res, err.message, 400, err.details);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return Response.error(res, message, statusCode);
};

module.exports = errorHandler;
