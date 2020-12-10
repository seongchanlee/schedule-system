'use strict';
const async = require("async");

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

exports.up = function(db, callback) {
  async.series([
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_patient_id_fk'),
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_staff_id_fk'),
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_record_id_fk'),
    db.addForeignKey.bind(db, 'Appointment', 'Patient', 'Appointment_patient_id_fk',
    {
      'patient_id': 'id'
    },
    {
      onDelete: 'CASCADE'
    }),
    db.addForeignKey.bind(db, 'Appointment', 'Staff', 'Appointment_staff_id_fk',
    {
      'staff_id': 'id'
    },
    {
      onDelete: 'CASCADE'
    }),
    db.addForeignKey.bind(db, 'Appointment', 'Admission_record', 'Appointment_record_id_fk',
    {
      'record_id': 'id'
    },
    {
      onDelete: 'CASCADE'
    })
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_patient_id_fk'),
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_staff_id_fk'),
    db.removeForeignKey.bind(db, 'Appointment', 'Appointment_record_id_fk'),
    db.addForeignKey.bind(db, 'Appointment', 'Patient', 'Appointment_patient_id_fk',
    {
      'patient_id': 'id'
    },
    {
      onDelete: 'RESTRICT'
    }),
    db.addForeignKey.bind(db, 'Appointment', 'Staff', 'Appointment_staff_id_fk',
    {
      'staff_id': 'id'
    },
    {
      onDelete: 'RESTRICT'
    }),
    db.addForeignKey.bind(db, 'Appointment', 'Admission_record', 'Appointment_record_id_fk',
    {
      'record_id': 'id'
    },
    {
      onDelete: 'RESTRICT'
    }),
  ], callback);
};

exports._meta = {
  "version": 1
};
