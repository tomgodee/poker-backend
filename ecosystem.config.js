module.exports = {
  apps : [{
    name   : "www",
    script : "./app.js",
    env: {
      "TOKEN_SECRET": "secret",
      "DATABASE_URL": "postgres://postgres:zxcv3210@tom-db.ceqa6r56ry4m.ap-southeast-1.rds.amazonaws.com/tom",
      "PM2_PUBLIC_KEY": "ctedt4b907ps3is",
      "PM2_SECRET_KEY": "lihzkpzhw87gdzq"
    }
  }]
}
