import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import requestTime from './middlewares/requestTime';
import userRouter from './routes/user/UserRouter';
import pingRouter from './routes/ping/PingRouter';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestTime)

app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

app.use('/ping', pingRouter);
app.use('/user', userRouter);

export default app;