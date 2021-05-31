import express from 'express';
import requestTime from '../../middlewares/requestTime';

const pingRouter = express.Router();

pingRouter.use(requestTime);

pingRouter.get('/', (req, res) => {
  res.send(`pong at ${req.requestTime}`);
});

export default pingRouter;
