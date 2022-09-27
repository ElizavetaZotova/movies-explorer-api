const { Router } = require('express');
const { getUserInfo, updateUser } = require('../controllers/users');
const { updateUserInfoValidationSchema } = require('../middlewares/validators');

const usersRouter = Router();

usersRouter.get('/users/me', getUserInfo);

usersRouter.patch('/users/me', updateUserInfoValidationSchema, updateUser);

module.exports = usersRouter;
