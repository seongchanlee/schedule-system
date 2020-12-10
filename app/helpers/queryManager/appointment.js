const qm = require("@app/helpers/queryManager");
const mysql = require('mysql');
const moment = require('moment');

const TABLE_NAME = "Appointment";
const VISIBLE_COLUMNS = ["id", "patient_id", "staff_id", "record_id", "patient_category",
  "type_of_therapy", "start_date", "end_date", "repetition", "start_time", "end_time", "is_attend"];

const USER_TABLE_NAME = "User";
const USER_VISIBLE_COLUMNS = ["id", "username", "email", "phone_number",
  "first_name","last_name", "type", "permission_level"];

module.exports = {

  getAppointmentFromId: function(id) {
    const query = qm.getWithIdBaseQuery(TABLE_NAME, id, { columns: VISIBLE_COLUMNS });
    return qm.makeQuery(query);
  },

  createAppointment: function(data) {
    return qm.createThenGetEntry(TABLE_NAME, data, { columns: VISIBLE_COLUMNS });
  },

  updateAppointmentWithId: function(id, data) {
    return qm.updateThenGetEntry(TABLE_NAME, id, data, { columns: VISIBLE_COLUMNS });
  },

  softDeleteAppointmentWithId: function(id) {
    return qm.softDeleteEntry(TABLE_NAME, id, { is_cancelled: true });
  },

  revertSoftDeleteAppointmentWithId: function(id) {
    return qm.softDeleteEntry(TABLE_NAME, id, { is_cancelled: false });
  },

  getAppointmentWithId: function(id) {
    const query = qm.getWithIdBaseQuery(TABLE_NAME, id);
    return qm.makeQuery(query);
  },

  getUserWithIdFromTable: function(id) {
    const query = qm.getWithIdBaseQuery(USER_TABLE_NAME, id, { columns: USER_VISIBLE_COLUMNS });
    return qm.makeQuery(query);
  },

  getAppointmentAccordingToUser: function(id, type) {
    let queryString = "";
    if (type === "Staff") {
      queryString = "SELECT * FROM Appointment " +
        "LEFT JOIN (SELECT ?? FROM User WHERE type = 'Patient' AND active = 1) " +
        "AS Patient ON Appointment.patient_id = Patient.id " +
        "WHERE Appointment.staff_id = ? AND Appointment.is_cancelled=false";
    } else {
      queryString = "SELECT * FROM Appointment " +
        "LEFT JOIN (SELECT ?? FROM User WHERE type = 'Staff' AND active = 1) " +
        "AS Staff ON Appointment.staff_id = Staff.id " +
        "WHERE Appointment.patient_id = ? AND Appointment.is_cancelled=false";
    }
    const query = mysql.format(queryString, [USER_VISIBLE_COLUMNS, id]);
    const options = {sql: query, nestTables: true};
    return qm.getQueryWithOverlap(options);
  },

  getTimeConflictAppointmentCreate: function(userId, type, data) {
    const {start_time, start_date, end_time} = data;
    let queryString = "";
    if (type === "Staff") {
      queryString = "SELECT id FROM Appointment " +
        "WHERE staff_id = ? AND start_date = ? AND is_cancelled = false " +
        "AND (TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(start_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001) " +
        "OR TIME(end_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001))";
    } else if (type === "Patient") {
      queryString = "SELECT id FROM Appointment " +
        "WHERE patient_id = ? AND start_date = ?  AND is_cancelled = false " +
        "AND (TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(start_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001) " +
        "OR TIME(end_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001))";
    }
    const query = mysql.format(queryString,
      [userId, start_date, start_time, end_time, start_time, end_time, start_time, end_time]
    );
    return qm.makeQuery(query);
  },

  getTimeConflictAppointmentUpdate: function(userId, type, data, id) {
    const {start_time, start_date, end_time} = data;
    let queryString = "";
    if (type === "Staff") {
      queryString = "SELECT id FROM Appointment " +
        "WHERE id <> ? AND staff_id = ? AND start_date = ? AND is_cancelled = false " +
        "AND (TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(start_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001) " +
        "OR TIME(end_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001))";
    } else if (type === "Patient") {
      queryString = "SELECT id FROM Appointment " +
        "WHERE id <> ? AND patient_id = ? AND start_date = ?  AND is_cancelled = false " +
        "AND (TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(?) BETWEEN ADDTIME(start_time, 000001) AND SUBTIME(end_time, 000001) " +
        "OR TIME(start_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001) " +
        "OR TIME(end_time) BETWEEN ADDTIME(?, 000001) AND SUBTIME(?, 000001))";
    }
    const query = mysql.format(queryString,
      [id, userId, start_date, start_time, end_time, start_time, end_time, start_time, end_time]
    );
    return qm.makeQuery(query);
  },

  getUpcomingAppointmentsAccordingToUser: function(userId, type) {
    let queryString = "";
    if (type === "Staff") {
      queryString = "SELECT * FROM Appointment " +
        "WHERE staff_id = ? AND start_date > ? AND is_cancelled=false";
    } else if (type === "Patient") {
      queryString = "SELECT * FROM Appointment " +
        "WHERE patient_id = ? AND start_date > ? AND is_cancelled=false"
    }

    const query = mysql.format(queryString, [userId, moment().format("YYYY-MM-DD")]);
    return qm.makeQuery(query);
  }
}