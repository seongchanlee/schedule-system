'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.removeColumn("Staff", "therapist_code");
};

exports.down = function(db) {
  return db.addColumn("Staff", "therapist_code", {
    type: "string",
    length: 10,
    notNull: true
  });
};

exports._meta = {
  "version": 1
};
