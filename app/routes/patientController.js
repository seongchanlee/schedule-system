const routes = require('express').Router();
const userManager = require("@app/helpers/queryManager/user");
const patientManager = require("@app/helpers/queryManager/patient");
const admissionRecordManager = require("@app/helpers/queryManager/admissionRecord");
const db = require("@config/db/connection").connectDatabase();

routes.get("/", async (req, res) => {
  let patients;
  try {
    patients = req.query.mrn ? await patientManager.getActivePatients(req.query) 
      : await patientManager.getOngoingPatients(req.query);
  } catch (e) {
    return res.status(500).json(e);
  }
  res.status(200);
  res.send(patients);
});

routes.get("/discharged", (req, res) => {
  patientManager.getDischargedPatients(req.query)
    .then(result => {
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

routes.get("/:patient_id/admission_records/current", (req, res) => {
  const { patient_id } = req.params;
  admissionRecordManager.getCurrentAdmissionRecords({ patient_id })
    .then(result => {
      if (result.length !== 1) {
        if (result.length === 0) {
          // TODO: better error message using MessageUtils
          res.status(404);
          return res.send("Current admission record does not exist");
        } else {
          // TODO: better message
          throw new Error("your database is messed up");
        }
      }
      res.status(200);
      res.send(result[0]);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

routes.delete("/:patient_id/admission_records/current", (req, res) => {
  const { patient_id } = req.params;
  admissionRecordManager.dischargeAdmissionRecordWithPatientId(patient_id)
    .then(result => {
      res.sendStatus(204);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

routes.get("/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  await db.beginTransaction();
  try {
    const patient = await patientManager.getPatientWithId(patient_id);
    const currentRecord = await admissionRecordManager.getCurrentAdmissionRecords({ patient_id });
    if (patient.length !== 1) {
      if (patient.length === 0) {
        // TODO: better error message using MessageUtils
        res.status(404);
        return res.send("Patient does not exist");
      } else {
        // TODO: better message
        throw new Error("your database is messed up");
      }
    }
    if (currentRecord.length !== 1) {
      // TODO: better message
      throw new Error("Your database is messed up");
    }
    await db.commit();
    const result = Object.assign({...patient[0]}, { Admission_record: currentRecord[0] });
    res.status(200);
    return res.send(result);
  } catch(e) {
    await db.rollback()
    res.status(500).json(e);
  }
});

routes.get("/:patient_id/admission_records/current", (req, res) => {
  const { patient_id } = req.params;
  const query = Object.assign({...req.query}, { patient_id });
  admissionRecordManager.getCurrentAdmissionRecords({ patient_id })
    .then(result => {
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});


routes.post("/", async (req, res) => {
  await db.beginTransaction();
  try {
    const userData = Object.assign({...req.body.User}, { username: req.body.Patient.mrn });
    const user = await userManager.createUser(userData);
    const patientData = Object.assign({...req.body.Patient}, { id: user[0].id });
    const admissionRecordData = Object.assign({...req.body.Admission_record}, { patient_id: user[0].id });
    const patient = await patientManager.createPatient(patientData);
    const admissionRecord = await admissionRecordManager.createAdmissionRecord(admissionRecordData);
    await db.commit();
    res.status(200);
    res.send({
      User: user[0],
      Patient: patient[0],
      Admission_record: admissionRecord[0]
    });
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
});

routes.put("/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  await db.beginTransaction();
  try {
    const userData = Object.assign({...req.body.User}, { username: req.body.Patient.mrn });
    const user = await userManager.updateUserWithId(patient_id, userData);
    const patient = await patientManager.updatePatientWithId(patient_id, req.body.Patient);
    const admissionRecord = await admissionRecordManager.updateAdmissionRecord(req.body.Admission_record);
    await db.commit();
    res.status(200);
    res.send({
      User: user[0],
      Patient: patient[0],
      Admission_record: admissionRecord[0]
    });
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
});

routes.delete("/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  await db.beginTransaction();
  try {
    await admissionRecordManager.dischargeAdmissionRecordWithPatientId(patient_id);
    await userManager.softDeleteUserWithId(patient_id);
    await db.commit();
    res.sendStatus(204);
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
});

module.exports = routes;
