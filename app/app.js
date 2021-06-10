import express from 'express';
import path from 'path';
import cors from './middlewares/cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import requestTime from './middlewares/requestTime';
import userRouter from './routes/user/UserRouter';
import pingRouter from './routes/ping/PingRouter';
import roomRouter from './routes/room';
import { httpServer as socketServer } from './websocket/server';
var app = express();

// Websocket server
socketServer.listen(3000);

// Http server
// Default middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Library middlewares
app.use(cors);

// enable pre-flight request 
// TODO: app.use(cors) might solve this already so might need to check this in the future to see if we need this line
app.options('/', cors);

// Hand-written middlewares
app.use(requestTime)

app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

app.use('/ping', pingRouter);
app.use('/user', userRouter);
app.use('/room', roomRouter);

export default app;
