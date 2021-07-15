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
  return db.one('INSERT INTO public.user(name, hashed_password) VALUES($1, $2) RETURNING id', [name, hashedPassword])
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
    });
}

const updateUser = (id, role, money) => {
  return db.one(`UPDATE public.user
          SET role = $(role),
              money = $(money)
          WHERE id = $(id)
          RETURNING id, name, role, money`
    , { id, role, money })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

const updateMoneyByID = (id, money) => {
  return db.one(`UPDATE public.user
          SET money = $(money)
          WHERE id = $(id)
          RETURNING id, name, money`
    , { id, money })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

const updateMoneyByName = (name, money) => {
  return db.one(`UPDATE public.user
          SET money = $(money)
          WHERE name = $(name)
          RETURNING id, name, role, money`
    , { name, money })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}

export default {
  getUser,
  createUser,
  updateUser,
  updateMoneyByID,
  updateMoneyByName,
};
