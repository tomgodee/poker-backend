import cors from 'cors';

export const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002']

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: allowedOrigins,
    }
  } else {
    corsOptions = {
      origin: false
    } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

export default cors(corsOptionsDelegate);
