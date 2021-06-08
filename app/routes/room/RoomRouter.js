import express from 'express';
// import jwt from 'jsonwebtoken';
import RoomModel from '../../models/Room';

const roomRouter = express.Router();

roomRouter.post('/', async (req, res) => {
  try {
    const roomId = await RoomModel.createRoom({
      type: req.body.type,
      max_number_of_player: req.body.max_number_of_player,
      random_seat: req.body.random_seat,
      seat_selectable: req.body.seat_selectable,
    });

    res.json({
      id: roomId,
    });
  } catch (err) {
    console.log('ERROR: ', err);
    res.status(401).send({
      status: 'error',
      message: err,
    });
  }
});

roomRouter.get('/:id', async(req, res) => {
  try {
    const room = await RoomModel.getRoom(req.params.id);

    res.json({
      room,
    });
  } catch (err) {
    console.log('ERROR: ', err);
    res.status(401).send({
      status: 'error',
      message: err,
    });
  }
});

roomRouter.get('/', async(req, res) => {
  try {
    const rooms = await RoomModel.getAllRoom();

    res.json({
      rooms,
    });
  } catch (err) {
    console.log('ERROR: ', err);
    res.status(401).send({
      status: 'error',
      message: err,
    });
  }
});

roomRouter.put('/:id', async (req, res) => {
  try {
    const room = await RoomModel.updateRoom(req.params.id, {
      type: req.body.type
    });
    console.log('room', room);

    res.status(200).json({
      room,
    });
  } catch (err) {
    console.log('ERROR: ', err);
    res.status(401).send({
      status: 'error',
      message: err,
    });
  }
});

export default roomRouter;
