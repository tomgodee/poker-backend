import express from 'express';
import path from 'path';
import cors from './middlewares/cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import requestTime from './middlewares/requestTime';
import userRouter from './routes/user/UserRouter';
import pingRouter from './routes/ping/PingRouter';
import roomRouter from './routes/room';
import http from 'http';
import io from 'socket.io';
import { allowedOrigins } from './middlewares/cors';

var app = express();

const httpServer = http.createServer(app);
const ioServer = io(httpServer, {
  cors: {
    origin: allowedOrigins,
  }
});

ioServer.on("connection", (socket) => {
  // console.log('socket', socket.id);
  let room;
  socket.on('join room', (data) => {
    // console.log('User', data.username, 'joins room ', data.roomId);
    room = `room ${data.roomId}`;1
    socket.join(room);
  });

  socket.on('client sends message', (message, sendAcknowledgement) => {
    ioServer.to(room).emit('server sends message', message);
    sendAcknowledgement(message);
  });
});

httpServer.listen(3000);

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