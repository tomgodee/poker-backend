import cors from 'cors';

const allowlist = ['http://localhost:3001', 'http://localhost:3002']
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: allowlist,
    }
  } else {
    corsOptions = {
      origin: false
    } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

export default cors(corsOptionsDelegate);
