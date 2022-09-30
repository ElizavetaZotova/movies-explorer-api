const { Router } = require('express');

const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { loginValidationSchema, createUserValidationSchema } = require('../middlewares/validators');

const authRouter = Router();

authRouter.post('/signin', loginValidationSchema, login);
authRouter.post('/signup', createUserValidationSchema, createUser);

authRouter.get('/signout', auth, (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

module.exports = authRouter;
