require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { errors } = require('celebrate');


const NotFound = require('./errors/not-found');

const { login, createUser } = require('./controllers/users');

const { loginValidationSchema, createUserValidationSchema } = require('./middlewares/validators');
const auth = require('./middlewares/auth');
const defaultError = require('./middlewares/default-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const userRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');

const { PORT = 3000 } = process.env;

const allowedCors = [
  'http://liza.nomoredomains.sbs',
  'https://liza.nomoredomains.sbs',
  'http://localhost:3001',
  'http://51.250.96.186',
];

const app = express();

// eslint-disable-next-line consistent-return
app.use((req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);

    return res.status(200).send();
  }

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(requestLogger);

app.use(morgan('tiny'));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', loginValidationSchema, login);
app.post('/signup', createUserValidationSchema, createUser);

app.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

app.use(auth);

app.use('/', userRouter);
app.use('/', moviesRouter);

app.use('*', () => {
  throw new NotFound('Запрашиваемый URL не существует');
});

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(errorLogger);
app.use(errors());
app.use(defaultError);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Сервер запущен на ${PORT} порту`));
