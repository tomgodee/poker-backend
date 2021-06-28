import cors from 'cors';

export const allowedOrigins = ['http://192.168.1.2:3001', 'http://localhost:3001', 'http://localhost:3002', 'http://tom-poker-frontend.s3-website-ap-southeast-1.amazonaws.com']

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: allowedOrigins,
    }
  } else {
    corsOptions = {
      origin: true
    } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

export default cors(corsOptionsDelegate);
