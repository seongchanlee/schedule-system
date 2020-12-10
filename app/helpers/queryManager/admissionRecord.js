const qm = require("@app/helpers/queryManager");
const mysql = require('mysql');
const db = require("@config/db/connection").connectDatabase();
const userManager = require("@app/helpers/queryManager/user");

const TABLE_NAME = "Admission_record";

module.exports = {
  TABLE_NAME: TABLE_NAME,

  getAdmissionRecords: function(query = {}) {
    const options = { where: query };
    const stmt = qm.getBaseQuery(TABLE_NAME, options);
    return qm.makeQuery(stmt);
  },

  getCurrentAdmissionRecords: function(query = {}) {
    const options = { where: query };
    let stmt = qm.getBaseQuery(TABLE_NAME, options);
    if (Object.keys(query).length === 0) {
      stmt = mysql.format(
        `${stmt} WHERE discharge_date IS NULL OR discharge_date > ?`,
        [moment().format("YYYY-MM-DD")]
      );
    } else {
      stmt = mysql.format(
        `${stmt} AND (discharge_date IS NULL OR discharge_date > ?)`,
        [moment().format("YYYY-MM-DD")]
      );
    }
    return qm.makeQuery(stmt);
  },

  createAdmissionRecord: async function(data) {
    let result;
    await db.beginTransaction();
    try {
      const dischargeResult = await this.dischargeAdmissionRecordWithPatientId(data.patient_id);
      await userManager.updateUserWithId(data.patient_id, { active: true });
      result = await qm.createThenGetEntry(TABLE_NAME, data);
      await db.commit();
    } catch(e) {
      await db.rollback();
      throw e;
    }
    return result;
  },

  updateAdmissionRecord: function(data) {
    return qm.updateThenGetEntry(TABLE_NAME, data.id, data);
  },

  dischargeAdmissionRecordWithPatientId: function(patient_id) {
    let stmt = mysql.format(
      "UPDATE ?? SET ? WHERE patient_id = ? AND (discharge_date IS NULL OR discharge_date > ?)",
      [TABLE_NAME, { discharge_date: moment().format("YYYY-MM-DD") }, patient_id, moment().format("YYYY-MM-DD")]
    );
    return qm.makeQuery(stmt);
  },

  getCurrentRecordStmt: function(columns) {
    return mysql.format(
      `${qm.getBaseQuery(TABLE_NAME, columns ? { columns } : null)}
      WHERE discharge_date IS NULL OR discharge_date > ?`,
      [moment().format("YYYY-MM-DD")]
    );
  }
}
