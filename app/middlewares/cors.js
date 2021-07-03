import cors from 'cors';

// Origin must not have a slash / at the end or else it won't work
export const allowedOrigins = ['https://d2s10as78akinj.cloudfront.net', 'http://localhost:3001', 'http://localhost:3002', 'http://tom-poker-frontend.s3-website-ap-southeast-1.amazonaws.com']

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
