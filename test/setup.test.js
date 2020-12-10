require('module-alias/register');
const server = require('@root/server', {bustCache: true} );
const connection = require("@config/db/connection");
global.db = connection.connectDatabase();
let DatabaseCleaner = require('database-cleaner');
global.databaseCleaner = new DatabaseCleaner("mysql");
global.chai = require("chai");
global.sinon = require("sinon");
global.chaiHttp = require("chai-http");
global.assert = chai.assert;
global.expect = chai.expect;
global.spy = sinon.spy;
global.stub = sinon.stub;

before(() => {
  global.server = server;
  chai.use(chaiHttp);
});

after((done) =>{
  server.close(() =>{
    delete require.cache[require.resolve('@root/server')];
    done();
  });
});
