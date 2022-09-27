const { ERR_DEFAULT } = require('../const/errors');

const defaultError = (err, req, res, next) => {
  const { statusCode = ERR_DEFAULT, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === ERR_DEFAULT
        ? 'Ошибка сервера. Попробуйте позже'
        : message,
    });

  next();
};

module.exports = defaultError;
