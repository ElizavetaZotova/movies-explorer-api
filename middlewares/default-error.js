const { ERR_DEFAULT } = require('../const/errors');
const { DEFAULT_SERVER_ERROR } = require('../const/errors-message');

const defaultError = (err, req, res, next) => {
  const { statusCode = ERR_DEFAULT, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === ERR_DEFAULT
        ? DEFAULT_SERVER_ERROR
        : message,
    });

  next();
};

module.exports = defaultError;
