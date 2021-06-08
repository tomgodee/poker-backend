To run:
  - npm run watch:dev

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

connecting to pgServer1 server: zxc321

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
