exports.errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, error: message });
}
