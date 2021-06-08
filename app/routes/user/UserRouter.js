import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../../config/constants';
import UserModel from '../../models/User';

const userRouter = express.Router();

const generateAccessToken = (userInfo) => {
  return jwt.sign(userInfo, process.env.TOKEN_SECRET, { expiresIn: '1d' });
}

userRouter.post('/login', async (req, res) => {
  const user = await UserModel.getUser(req.body.username);
  bcrypt.compare(req.body.password, user.hashed_password, function(err, result) {
    if (result) {
      const token = generateAccessToken({
        username: req.body.username,
      });
      res.json(Object.assign(user, { accessToken: token }));
    } else {
      res.send(401, {
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
      const user = await UserModel.getUser(decoded.username);
      res.json(Object.assign(user, { requestTime: req.requestTime, }));
    } else if (err) {
      res.send(401, {
        status: 'error',
        message: 'Token is not verified',
      });
    }
  });
});

userRouter.put('/', (req, res) => {
  UserModel.updateUser(req.body.id, req.body.name, req.body.money);
  res.json(req.body.name);
});

userRouter.post('/', (req, res) => {
  bcrypt.hash(req.body.password, SALT_ROUNDS, (err, hash) => {
    // Store hash in your password DB.
    UserModel.createUser(req.body.name, hash);
  });
  res.json(req.body.name);
});

export default userRouter;