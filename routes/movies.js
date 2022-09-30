const { Router } = require('express');
const {
  createUserMovie,
  getUserMovies,
  deleteUserMovieById,
} = require('../controllers/movies');
const {
  idValidationSchema,
  movieValidationSchema,
} = require('../middlewares/validators');

const moviesRouter = Router();

moviesRouter.get('/movies', getUserMovies);

moviesRouter.delete('/movies/:_id', idValidationSchema, deleteUserMovieById);

moviesRouter.post('/movies', movieValidationSchema, createUserMovie);

module.exports = moviesRouter;
