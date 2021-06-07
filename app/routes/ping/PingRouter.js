import express from 'express';

const pingRouter = express.Router();

pingRouter.get('/', (req, res) => {
  res.json({
    message: 'pong',
    requestTime: req.requestTime,
  });
});

export default pingRouter;
