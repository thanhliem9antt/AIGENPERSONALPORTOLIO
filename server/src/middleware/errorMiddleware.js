export function notFound(req, res) {
  res.status(404).json({ message: `Không tìm thấy ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'dữ liệu';
    return res.status(409).json({ message: `${field} đã tồn tại`, field });
  }
  if (error.name === 'ValidationError') {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ', errors: Object.values(error.errors).map((item) => item.message) });
  }
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 && process.env.NODE_ENV === 'production' ? 'Đã có lỗi xảy ra' : error.message,
    details: error.details,
  });
}
