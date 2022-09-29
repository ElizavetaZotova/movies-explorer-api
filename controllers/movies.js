const Movie = require('../models/movie');
const NotFound = require('../errors/not-found');
const BadRequest = require('../errors/bad-request');
const ForbiddenError = require('../errors/forbidden-error');

const {
  FILM_BY_ID_NOT_FOUND,
  PERMISSIONS_DENIED
} = require('../const/errors-message');

module.exports.createUserMovie = (req, res, next) => {
  const owner = req.user._id;

  Movie.create({ owner, ...req.body })
    .then((movie) => res.send({
      data: movie,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(err.message));
      }

      next(err);
    });
};

module.exports.getUserMovies = (req, res, next) => Movie.find({
  owner: req.user._id,
})
  .then((movies) => res.send({ data: movies }))
  .catch(next);

module.exports.deleteUserMovieById = (req, res, next) => {
  const userId = req.user._id;
  const { _id: movieId } = req.params;

  Movie.findById(movieId)
    .orFail()
    .catch(() => {
      throw new NotFound(FILM_BY_ID_NOT_FOUND);
    })
    .then((movie) => {
      if (movie.owner.toString() !== userId) {
        throw new ForbiddenError(PERMISSIONS_DENIED);
      }

      return Movie.findByIdAndRemove(movieId);
    })
    .then((movie) => res.send({ data: movie }))
    .catch(next);
};
