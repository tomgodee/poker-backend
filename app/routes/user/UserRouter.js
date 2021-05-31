import express from 'express';
import requestTime from '../../middlewares/requestTime';

const userRouter = express.Router();

userRouter.use(requestTime);

userRouter.get('/', (req, res) => {
  res.json({
    user: 'tom',
    requestTime: req.requestTime,
  });
});

export default userRouter;
