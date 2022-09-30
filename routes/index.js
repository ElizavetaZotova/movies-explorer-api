const NotFound = require('../errors/not-found');
const auth = require('../middlewares/auth');

const authRouter = require('./auth');
const userRouter = require('./users');
const moviesRouter = require('./movies');

function initRoutes(app) {
  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Сервер сейчас упадёт');
    }, 0);
  });

  app.use('/', authRouter);

  app.use(auth);

  app.use('/', userRouter);
  app.use('/', moviesRouter);

  app.use('*', () => {
    throw new NotFound('Запрашиваемый URL не существует');
  });
}

module.exports = initRoutes;
