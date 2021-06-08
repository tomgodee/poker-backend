import db from '../services/DatabaseService';

const getRoom = async (id) => {
  return await db.one(`SELECT * FROM public.room WHERE id = $(id)`, { id })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return error;
    });
}

const getAllRoom = async () => {
  return await db.many(`SELECT * FROM public.room`)
  .then(data => {
    return data;
  })
  .catch(error => {
    console.log('ERROR:', error); // print error;
    return error;
  });
}

const createRoom = (roomData) => {
  return db.one(`
    INSERT INTO public.room(type, max_number_of_player, random_seat, seat_selectable)
    VALUES($1, $2, $3, $4)
    RETURNING id`,
    [
      roomData.type,
      roomData.max_number_of_player,
      roomData.random_seat,
      roomData.seat_selectable,
    ])
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

const updateRoom = (id, roomData) => {
  return db.one(`UPDATE public.room
          SET type = $(type)
          WHERE id = $(id)
          RETURNING *`
    , { 
        id,
        type: roomData.type,
      })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

export default {
  getRoom,
  getAllRoom,
  createRoom,
  updateRoom,
};
