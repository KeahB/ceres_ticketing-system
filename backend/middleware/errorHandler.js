const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const isBusy = err.message?.includes('SQLITE_BUSY');
  const status = isBusy ? 503 : 500;

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    message: isBusy
      ? 'Database is temporarily busy. Please retry syncing in a moment.'
      : err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
