# Schedule System

This repository will hold the source code for the schedule system for Coastal Health - GF Strong as part of the CPSC 319 Software Engineering Project course.

## Setup Guide
### Node Setup
Node version: 8.15.0 (lts/carbon)

Using **nvm** is highly recommended (https://github.com/creationix/nvm)
```
$ nvm install lts/carbon
$ nvm use lts/carbon
$ nvm alias default lts/carbon
```

### Environment Setup
NOTE: Using .env file for setup is highly recommended
1. create a file *.env* in project root (i.e. ~/path/to/schedule-system/.env)
2. add following lines into .env file

(For *secret_key*, see https://randomkeygen.com/ --> **CodeIgniter Encryption Keys**)
(For NODE_MAILER_PASSWORD, ask the developer in responsibility.)
```
COOKIE_SESSION_KEY=secret_key
DB_USERNAME=username
DB_PASSWORD=password
DB_HOST=localhost
DB_NAME=schedule_system
SERVER_PORT=4000
NODE_MAILER_USER=gfstrongtest123@gmail.com
NODE_MAILER_PASSWORD=********
```

3. create a file *.env* in client root (i.e. ~/path/to/schedule_system/client/.env)
4. add following lines into .env file
```
NODE_PATH=src/
```

### DB Setup
1. MySQL version **8.0.13** is definitely being supported. Not guaranteed for other version.
2. On your .env file, add NODE_ENV value depending on which database you want to use.
```
NODE_ENV=development
```
for testing create .env.test file and add
```
NODE_ENV=test
```
3. Run the following commands (you only need to do it once)
```
npm install -g db-migrate
npm install
```
4. Log in to your MySQL console and create databases with following command
```
CREATE DATABASE schedule_system_development;
CREATE DATABASE database_cleaner;
```
5. Run the following command
```
db-migrate up
```
For test DB
```
NODE_ENV=test db-migrate up
```

### Commands to Run Application
#### Dev Environment
NOTE: to avoid any possible crash, running concurrent package will NOT be used at the moment. Instead, use two separate terminal tabs to run Server & Client
```
<!-- Server -->
$ npm install
$ npm run server-dev
```
```
<!-- Client -->
$ cd client
$ npm install
$ npm run start
```

### Commands to run tests
NODE_ENV=test npm run test
```