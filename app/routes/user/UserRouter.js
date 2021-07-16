import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../../config/constants';
import UserModel from '../../models/User';
import { verifyAdminToken, verifyToken } from '../../middlewares/verifyToken';

const userRouter = express.Router();

const generateAccessToken = (userInfo) => {
  return jwt.sign(userInfo, process.env.TOKEN_SECRET, { expiresIn: '1d' });
}

userRouter.post('/login', async (req, res) => {
  const user = await UserModel.getOneByName(req.body.username);
  bcrypt.compare(req.body.password, user.hashed_password, function(err, result) {
    if (result) {
      const token = generateAccessToken({
        username: req.body.username,
        role: user.role,
      });
      res.json(Object.assign(user, { accessToken: token }));
    } else {
      res.status(401).send({
        status: 'error',
        message: 'Can\'t authenticate',
      });
    }
  });
});

userRouter.get('/', (req, res) => {
  const accessToken = req.headers.authorization.split('Bearer ')[1];
  jwt.verify(accessToken, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (decoded) {
      const user = await UserModel.getOneByName(decoded.username);
      res.json(Object.assign(user, { requestTime: req.requestTime, }));
    } else if (err) {
      res.status(401).send({
        status: 'error',
        message: 'Token is not verified',
      });
    }
  });
});

userRouter.get('/:id', verifyToken);
userRouter.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.getOneByID(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({
      code: error.code,
      message: error.message
    });
  }
});

userRouter.put('/', verifyAdminToken);
userRouter.put('/', async (req, res) => {
  try {
    const user = await UserModel.update(req.body.id, req.body.role, req.body.money);
    res.json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

userRouter.put('/money', async (req, res) => {
  try {
    const user = await UserModel.updateMoneyByID(req.body.id, req.body.money);
    res.json(user);
  } catch (err) {
    res.status(401).send(err);
  }
});

userRouter.post('/', (req, res) => {
  bcrypt.hash(req.body.password, SALT_ROUNDS, (err, hash) => {
    UserModel.createOne(req.body.name, hash);
  });
  res.json(req.body.name);
});

export default userRouter;
