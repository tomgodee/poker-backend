import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.status(401).send({
      status: 'error',
      message: 'Token is required',
    });
  }

  const accessToken = bearerToken.split('Bearer ')[1];
    jwt.verify(accessToken, process.env.TOKEN_SECRET, async (err, decoded) => {
      console.log('decoded', decoded)
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
  