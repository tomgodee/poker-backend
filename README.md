To run (this will run nodemon which inside it runs clean, transpile, build and finally starts the server)
  - npm run watch

Preload the config with (from the dotenv docs)
```
-r dotenv/config
```

On how to install postgres and pgadmin:
  - https://www.youtube.com/watch?v=lX9uMCSqqko

To access postgres in cmd:
  - psql -U {username} -h localhost
  - Ex: psql -U postgres -h localhost 

Root user:
  - postgres ----- zxc321

User:
  - tom ----- zxcv321 

To see the list of db in cmd:
  - \l

To see the list of users in cmd:
  - \du

To exit the psql cmd:
  - \q

pgadmin master password: anTrust302

pgServer1 server user: postgres
pgServer1 server password: zxc321

Connect to local db: postgres://postgres:zxc321@localhost:5432/tom

Email for using pgadmin on web:
  - trungvu8295@gmail.com ----- zxc321

To access pgadmin on web:
  - http://127.0.0.1/pgadmin4/browser/

To setup expressjs with ES6:
  - https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/#setting-up-scripts
  - NOTE: The pg-promise package is a function that need an initialization obj when imported

To automatically update a field of a row:
  - Define an sql function
  ```
    CREATE OR REPLACE FUNCTION update_updated_at_column() 
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW; 
    END;
    $$ language 'plpgsql';
  ```

  - Define a trigger (i use pgadmin 4) but here's the code
  ```
    CREATE TRIGGER "Automatically_update_updated_at column"
    BEFORE UPDATE 
    ON public."user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    COMMENT ON TRIGGER "Automatically_update_updated_at column" ON public."user"
    IS 'Automatically update updated_at column';
  ```

  - Guide: 
    - https://www.postgresqltutorial.com/postgresql-create-function/
    - https://www.pgadmin.org/docs/pgadmin4/development/trigger_dialog.html
    - https://www.postgresql.org/docs/14/sql-createtrigger.html
    - https://www.revsys.com/tidbits/automatically-updating-a-timestamp-column-in-postgresql/

To use async/await syntax with babel v7:
  - https://stackoverflow.com/questions/53558916/babel-7-referenceerror-regeneratorruntime-is-not-defined

Primary key should be serial => how to alter an integer column to serial tho ???

Deploy to Heroku:
  - https://devcenter.heroku.com/articles/deploying-nodejs
  - Create an account
  - Download Heroku CLI
  - Specify the nodejs version that this app runs in package.json
    ```
    "engines": {
      "node": "14.x"
    },
    ```
  - To run heroku on local: 
    - heroku local web
  - To deploy:
    - heroku login
    - heroku create (this will create a random named app)
    - git push heroku ${CURRENT_BRANCH}

  - To provision a database: https://devcenter.heroku.com/articles/heroku-postgresql#provisioning-heroku-postgres
  - To check addons:
    - heroku addons
    - heroku addons:create heroku-postgresql:hobby-dev

  - pg:push wont work
  - To dump the local db to an sql file named tom.sql:
    - sudo pg_dump -U postgres -h localhost [DBNAME](tom) -f [FILE_NAME](tom).sql 
    - put in the password for the postgres user (in my case it's zxc321)
  - To restore the heroku db based on an .sql file
    - heroku pg:psql --app [APP_NAME](intense-bastion-63272) < [FILE_NAME](tom).sql 

  - To connect to heroku's postgres then we need to provide an ssl and allow self-signed certificate
    - https://www.javaniceday.com/post/pg-promise-self-signed-certificate-error-in-postgres

  - Deployment to AWS
    - Create a VPC => this will also create a route table
    - Create a subnet
    - Create an internet gateway(IGW) and attach it to a VPC
    - Go the the route table and add the route for IGW with the destination to be 0.0.0.0/0
    - Create an ec-2 instance
      - Choose to give the instance a public ipv4
    - Add inbound rule for the subnet
    - SSH into the instance
      - Install nodejs v12:
        ```
        curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
        sudo yum install nodejs
        ```
      - Check the version of node and npm:
        ```
        node -v
        npm -v
        ```
      - Install git and check its version:
        ```
        sudo yum install git
        git --version
        ```
      - Clone the project and run
      - Send request to http(s)://ipv4:${PORT}

    - This guide does pretty the above: 
      - https://ourcodeworld.com/articles/read/977/how-to-deploy-a-node-js-application-on-aws-ec2-server

    - Use pm2 to daemonize the server
      - https://pm2.keymetrics.io/docs/usage/application-declaration/
      - To create config file:
      ```
      npx pm2 ecosystem
      ```
      - Read https://pm2.keymetrics.io/docs/usage/environment/, I needed to change the name of the app in the config file based on the name in list

      - To run:
      ```
      npm run start:pm
      ```
      - And then to inject env variables
      ```
      npm run config:pm
      ```

      - Online dashboard:
        -  https://app.pm2.io/bucket/60f59aabc1adc9642a9de198/backend/overview/servers