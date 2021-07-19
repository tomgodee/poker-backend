module.exports = {
  apps : [{
    name   : "www",
    script : "./app.js",
    env: {
      "TOKEN_SECRET": "secret",
      "DATABASE_URL": "postgres://postgres:zxc321@localhost:5432/tom",
      "PM2_PUBLIC_KEY": "ctedt4b907ps3is",
      "PM2_SECRET_KEY": "lihzkpzhw87gdzq"
    }
  }]
}
