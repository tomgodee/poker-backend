import moment from 'moment';

const requestTime = (req, res, next) => {
  req.requestTime = moment(Date.now()).format('hh:mm:ss DD/MM/YYYY');
  next();
}

export default requestTime;
