require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { errors } = require('celebrate');

const defaultError = require('./middlewares/default-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const initRoutes = require('./routes');

const limiter = require('./utils/rate-limiter');

const { PORT = 3000, DB_NAME = 'moviesdb' } = process.env;

const allowedCors = [
  'http://liza.diplom.nomoredomains.club',
  'https://liza.diplom.nomoredomains.club',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://51.250.96.186',
];

const app = express();

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

  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(requestLogger);
app.use(morgan('tiny'));
app.use(limiter);

initRoutes(app);

mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(errorLogger);
app.use(errors());
app.use(defaultError);

app.listen(PORT);
