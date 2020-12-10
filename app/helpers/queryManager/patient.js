const qm = require("@app/helpers/queryManager");
const mysql = require('mysql');
const parent = require("@app/helpers/queryManager/user");
const admissionRecordManager = require("@app/helpers/queryManager/admissionRecord");

const TABLE_NAME = "Patient";
const PARENT_TABLE_NAME = parent.TABLE_NAME;
const VISIBILE_COLUMNS = ["mrn", "address", "emergency_contact",
  "is_in_patient", "patient_program", "date_of_birth"];
const PARENT_VISIBLE_COLUMNS = parent.VISIBILE_COLUMNS;
const ADMISSION_RECORD_TABLE_NAME = admissionRecordManager.TABLE_NAME

module.exports = {
  getOngoingPatients: function(query = {}) {
    const currentRecordStmt = admissionRecordManager.getCurrentRecordStmt(["patient_id"]);
    const columns = VISIBILE_COLUMNS.concat(PARENT_VISIBLE_COLUMNS);
    const where = Object.assign({...query}, query.mrn ? {} : { active: true });
    let stmt = mysql.format(
      `SELECT ?? FROM ?? INNER JOIN (SELECT * FROM ?? INNER JOIN (${currentRecordStmt})
      AS CurrentRecord ON ??.id = CurrentRecord.patient_id) AS Patient USING (id)`,
      [columns, PARENT_TABLE_NAME, TABLE_NAME, TABLE_NAME]
    );
    stmt = qm.appendWhereQuery(stmt, where);
    return qm.makeQuery({sql: stmt, nestTables: true });
  },

  getActivePatients: function(query = {}) {
    const options = {
      columns: VISIBILE_COLUMNS.concat(PARENT_VISIBLE_COLUMNS)
    };
    const where = Object.assign({...query}, query.mrn ? {} : { active: true });
    let stmt = mysql.format(
      `${qm.getBaseQuery(PARENT_TABLE_NAME, options)} INNER JOIN ?? USING (id)`,
      [TABLE_NAME]
    );
    stmt = qm.appendWhereQuery(stmt, where);
    return qm.makeQuery({sql: stmt, nestTables: true });
  },

  getDischargedPatients: function(query = {}) {
    const options = {
      columns: VISIBILE_COLUMNS.concat(PARENT_VISIBLE_COLUMNS)
    };
    const where = Object.assign({...query}, { active: true });
    const currentRecordStmt = admissionRecordManager.getCurrentRecordStmt(["patient_id"]);
    const ongoingPatientStmt = mysql.format(
      `SELECT id FROM ?? INNER JOIN (${currentRecordStmt})
      AS CurrentRecord ON ??.id = CurrentRecord.patient_id`,
      [TABLE_NAME, TABLE_NAME]
    );
    let stmt = mysql.format(
      `${qm.getBaseQuery(PARENT_TABLE_NAME, options)} INNER JOIN ?? USING (id)`,
      [TABLE_NAME]
    );
    stmt = `${qm.appendWhereQuery(stmt, where)} AND id NOT IN (${ongoingPatientStmt})`;

    return qm.makeQuery({sql: stmt, nestTables: true });
  },

  getPatientWithId: function(id) {
    return this.getActivePatients({id: id});
  },

  getCurrentAdmissionRecord: function(id) {
    return admissionRecordManager.getCurrentAdmissionRecord({ patient_id: id });
  },

  getAdmissionRecords: function(id) {
    return admissionRecordManager.getAdmissionRecords({ patient_id: id });
  },

  createPatient: function(data) {
    return qm.createThenGetEntry(TABLE_NAME, data);
  },

  updatePatientWithId: function(id, data) {
    return qm.updateThenGetEntry(TABLE_NAME, id, data);
  }
}
