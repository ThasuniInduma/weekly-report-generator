const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
    const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
    const message = err.message || "Internal server error";

    if (!(err instanceof ApiError) && process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        details: err.details,
    });
}

module.exports = { notFound, errorHandler };
