require('dotenv').config();
require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');

// Moment.js configuration
const moment = require("moment");
moment.locale("en");
global.moment = moment;

const db = require("@config/db/connection").connectDatabase();
const setupInitialAccount = require("./setupInitialAccount");
setupInitialAccount()
  .then(res => {
    if (res === false) {
      console.log("Admin User exists. Skipping initial account setup.");
    }
    if (res) {
      console.log("Admin User: " + res.username + " created");
    }
  })
  .catch(err => {
    console.error(err);
  });

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "common" : "dev"));
app.use(
  cookieSession({
    name: "session",
    maxAge: 1 * 1 * 3 * 60 * 1000,
    keys: [process.env.COOKIE_SESSION_KEY]
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(`${__dirname}/client/build`));
app.disable("etag");

// Use Session check middleware for authentication
const whiteList = [/\/api\/user\/session((\/)?(.*))/];
const sessionChecker = require("@app/middlewares/sessionChecker");
app.use(sessionChecker(whiteList));

// Serve API Routes
app.use("/api", require('@routes'));

// Serve public build assets
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'), err => {
    if (err) {
      res.status(500).send(err);
    }
  })
});

const serverPort = process.env.SERVER_PORT || 5000;
const server = app.listen(serverPort,
  () => console.log(`Running server at ${serverPort}`));

process.on('SIGINT', () => {
  console.log('\nReceived kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
  if (db) {
    db.end();
    console.log("db connection closed");
  };
});

//module exports is used for unit testing.
module.exports = server;