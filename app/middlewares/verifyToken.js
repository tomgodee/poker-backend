import jwt from 'jsonwebtoken';

const getBearerToken = (token) => {
  const bearerToken = token;
  if (!bearerToken) {
    res.status(401).send({
      status: 'error',
      message: 'Token is required',
    });
  } else {
    return bearerToken;
  }
}

export const verifyAdminToken = (req, res, next) => {
  const bearerToken = getBearerToken(req.headers.authorization);
  const accessToken = bearerToken.split('Bearer ')[1];
    jwt.verify(accessToken, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (decoded && decoded.role === 'admin') {
        next();
      } else {
        res.status(401).send({
          status: 'error',
          message: "You're not authorized to do this",
        });
      }
    });
}

export const verifyToken = (req, res, next) => {
  const bearerToken = getBearerToken(req.headers.authorization);
  const accessToken = bearerToken.split('Bearer ')[1];
  jwt.verify(accessToken, process.env.TOKEN_SECRET, (err, decoded) => {
    if (decoded) {
      next();
    } else if (err) {
      res.status(401).send({
        status: 'error',
        message: 'Token is not verified',
      });
    }
  });
}

export default {
  verifyAdminToken,
  verifyToken,
};
  