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
    db.createTable.bind(db, "User", {
      id: { type: "int", primaryKey: true, autoIncrement: true, notNull: true },
      username: { type: "string", length: 255, notNull: true, unique: true },
      password: { type: "string", length: 255, notNull: true },
      email: { type: "string", length: 255 },
      phone_number: { type: "string", length: 255, notNull: true },
      first_name: { type: "string", length: 255, notNull: true },
      last_name: { type: "string", length: 255, notNull: true },
      type: { type: "string", length: 20, notNull: true },
      permission_level: { type: "string", length: 20, notNull: true },
      active: { type: "boolean", notNull: true, defaultValue: true }
    }),
    db.createTable.bind(db, "Administrator", {
      id: {
        type: "int",
        primaryKey: true,
        notNull: true,
        foreignKey: {
          name: "Administrator_id_fk",
          table: "User",
          mapping: "id",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "RESTRICT"
          }
        }
      }
    }),
    db.createTable.bind(db, "Staff", {
      id: {
        type: "int",
        primaryKey: true,
        notNull: true,
        foreignKey: {
          name: "Staff_id_fk",
          table: "User",
          mapping: "id",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "RESTRICT"
          }
        }
      },
      therapist_code: { type: "string", length: 10, notNull: true },
      therapist_type: { type: "string", length: 255, notNull: true }
    }),
    db.createTable.bind(db, "Patient", {
      id: {
        type: "int",
        primaryKey: true,
        notNull: true,
        foreignKey: {
          name: "Patient_id_fk",
          table: "User",
          mapping: "id",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "RESTRICT"
          }
        }
      },
      mrn: { type: "string", length: 255, notNull: true, unique: true },
      address: { type: "string", length: 255 },
      emergency_contact: { type: "string", length: 255 },
      is_in_patient: { type: "boolean", notNull: true },
      patient_program: { type: "string", length: 5, notNull: true },
      date_of_birth: { type: "date", notNull: true }
    }),
    db.createTable.bind(db, "Admission_record", {
      id: { type: "int", primaryKey: true, autoIncrement: true, notNull: true },
      patient_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "Admission_record_patient_id_fk",
          table: "Patient",
          mapping: "id",
          rules: {
            onDelete: "RESTRICT"
          }
        }
      },
      patient_category: { type: "int", notNull: true },
      admission_date: { type: "date", notNull: true },
      discharge_date: "date",
      type_of_injury: { type: "string", length: 255, notNull: true },
      comment: { type: "string", length: 255 },
      created_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" }
    }),
    db.createTable.bind(db, "Appointment", {
      id: { type: "int", primaryKey: true, autoIncrement: true, notNull: true },
      patient_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "Appointment_patient_id_fk",
          table: "Patient",
          mapping: "id",
          rules: {
            onDelete: "RESTRICT"
          }
        }
      },
      staff_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "Appointment_staff_id_fk",
          table: "Staff",
          mapping: "id",
          rules: {
            onDelete: "RESTRICT"
          }
        }
      },
      record_id: {
      type: "int",
        notNull: true,
        foreignKey: {
          name: "Appointment_record_id_fk",
          table: "Admission_record",
          mapping: "id",
          rules: {
            onDelete: "RESTRICT"
          }
        }
      },
      patient_category: { type: "int", notNull: true },
      type_of_therapy: { type: "string", length: 255, notNull: true },
      start_date: { type: "date", notNull: true },
      end_date: "date",
      repetition: { type: "string", length: 20 },
      start_time: { type: "time", notNull: true },
      end_time: { type: "time", notNull: true },
      is_cancelled: { type: "boolean", notNull: true }
    })
  ], callback);

};

exports.down = function(db, callback) {
  async.series([
    db.dropTable.bind(db, "Appointment"),
    db.dropTable.bind(db, "Admission_record"),
    db.dropTable.bind(db, "Patient"),
    db.dropTable.bind(db, "Staff"),
    db.dropTable.bind(db, "Administrator"),
    db.dropTable.bind(db, "User")
  ], callback);
};

exports._meta = {
  "version": 1
};
