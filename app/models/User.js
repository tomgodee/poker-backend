import db from '../services/DatabaseService';

const getUser = async (name) => {
  return await db.one(`SELECT * FROM public.user WHERE name = $(name)`, { name })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return error;
    });
}

const createUser = (name, hashedPassword) => {
  db.one('INSERT INTO public.user(name, hashed_password) VALUES($1, $2) RETURNING id', [name, hashedPassword])
    .then(data => {
      console.log(data.id); // print new user id;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
    });
}

const updateUser = (id, name, money) => {
  db.one(`UPDATE public.user
          SET name = $(name),
              money = $(money)
          WHERE id = $(id)
          RETURNING name, id, money`
    , { name, id, money })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

export default {
  getUser,
  createUser,
  updateUser,
};
