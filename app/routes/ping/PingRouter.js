import express from 'express';

const pingRouter = express.Router();

pingRouter.get('/', (req, res) => {
  res.send(`pong at ${req.requestTime}`);
});

export default pingRouter;
