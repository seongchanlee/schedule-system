const qm = require("@app/helpers/queryManager");
const mysql = require('mysql');

const PATIENT_COLUMNS = ["id", "mrn", "current_admission_record"];

module.exports = {
  // Retrieves individual reports
  getAllAppointmentsWithPatientAndAdmissionRecordInfo: function () {
    const query = "SELECT A.id AS appointment_id, A.patient_id , A.record_id, " +
      "CONCAT(U.first_name, ' ', U.last_name) AS patient_name, CONCAT(S.first_name, ' ', S.last_name) AS staff_name, " +
      "P.mrn, A.start_date, A.end_date, (TIME_TO_SEC(A.end_time) - TIME_TO_SEC(A.start_time))/60 DIV 1 as duration, " +
      "A.type_of_therapy, A.is_attend, A.is_cancelled, AR.admission_date, AR.discharge_date, AR.patient_category, " +
      "AR.type_of_injury FROM Appointment AS A " +
      "LEFT JOIN Admission_record AS AR ON A.record_id = AR.id " +
      "LEFT JOIN User AS U ON A.patient_id = U.id " +
      "LEFT JOIN User AS S on A.staff_id = S.id " +
      "LEFT JOIN Patient AS P on A.patient_id = P.id " +
      "WHERE A.is_cancelled = false AND U.active = 1 " +
      "AND (AR.discharge_date IS NULL OR AR.discharge_date > ?) " +
      "ORDER BY AR.admission_date DESC";
    return qm.makeQuery(mysql.format(query, [moment().format("YYYY-MM-DD")]));
  },

  getAllAppointmentsByCategory: function (category) {
    // TODO: Mapping of database styled variables to JS conventions done here, but eventually
    // there should be a universal way of doing it on a higher layer.
    const query = "SELECT " +
      "A.patient_id AS patientId, " +
      "A.record_id AS recordId, " +
      "A.type_of_therapy AS therapyType, " +
      "A.start_date AS date, " +
      "(TIME_TO_SEC(A.end_time) - TIME_TO_SEC(A.start_time))/60 DIV 1 AS duration, " +
      "A.is_attend AS isAttend " +
      "FROM Appointment AS A " +
      "WHERE A.is_cancelled = false AND patient_category = " + category;

    return qm.makeQuery(query);
  },

  /** These functions are currently not being used.

  getPatientInfoFromUserId: function (user_id) {
    const query = "SELECT CONCAT(U.first_name, ' ', U.last_name) AS patient_name, P.mrn, P.current_admission_record " +
      "FROM Patient AS P LEFT JOIN user AS U ON P.id = U.id " +
      "WHERE P.id = " + user_id;

    return qm.makeQuery(query);
  },

  getAppointmentsWithRecordId: function (record_id) {
    const query = "SELECT id AS appointment_id, start_date, end_date, " +
      "(TIME_TO_SEC(end_time) - TIME_TO_SEC(start_time))/60 DIV 1 as duration FROM Appointment " +
      "WHERE record_id = " + record_id;

    return qm.makeQuery(query);
  }
  */
}