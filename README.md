# A server for playing poker

## Tech Stack:
* ExpressJS
* PostgreSQL
* Socket.io

## Deployment:
### Dev env:
* Server and database are deployed to heroku

### Prod env:
* Server and database are deployed to aws ec-2 and RDS

### To check if the prod server is alive:
```
curl --location --request GET 'http://13.229.65.159:2000/ping'
```