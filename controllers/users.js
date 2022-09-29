const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFound = require('../errors/not-found');
const ConflictError = require('../errors/conflict-error');
const BadRequest = require('../errors/bad-request');

const {
  EMAIL_EXIST_MESSAGE,
  USER_WITH_ID_NOT_FOUND,
  INVALID_DATA,
} = require('../const/errors-message');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
    )
    .then((user) =>
      res.send({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    )
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError(EMAIL_EXIST_MESSAGE));
      }

      if (err.name === 'ValidationError') {
        next(new BadRequest(INVALID_DATA));
      }

      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.checkUserPassword(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
        { expiresIn: '7d' }
      );

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .send({
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        });
    })
    .catch(next);
};

module.exports.getUserInfo = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFound(USER_WITH_ID_NOT_FOUND);
      }
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  User.findOne({
    email,
    _id: { $ne: userId },
  })
    .then((user) => {
      if (user) {
        return next(new ConflictError(EMAIL_EXIST_MESSAGE));
      }

      return User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true, runValidators: true }
      );
    })
    .then((user) => {
      if (!user) {
        throw new NotFound(USER_WITH_ID_NOT_FOUND);
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(INVALID_DATA));
      }

      next(err);
    });
};
