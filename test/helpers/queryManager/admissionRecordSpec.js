describe('admissionRecordQueryManager unit test', () => {
  let admissionRecordQueryManager;
  let queryManager;
  let getBaseQuerySpy;
  let makeQuery;

  before(() => {
    admissionRecordQueryManager = require('@app/helpers/queryManager/admissionRecord');
    queryManager = require('@app/helpers/queryManager');
    userManager = require("@app/helpers/queryManager/user");
    const moment = require('moment');
    const mysql = require('mysql');
  });

  beforeEach(() => {
    getBaseQuerySpy = spy(queryManager, "getBaseQuery");
    makeQuerySpy = spy(queryManager, "makeQuery");
  });

  afterEach(() => {
    getBaseQuerySpy.restore();
    makeQuerySpy.restore();
  });

  describe('admissionRecordQueryManager before admission record is created', () => {
    it("getAdmissionRecords", async () => {
      let query = {};
      let getAdmissionRecordsSpy = spy(admissionRecordQueryManager, "getAdmissionRecords");

      expect(getAdmissionRecordsSpy.callCount).to.equal(0);
      expect(getBaseQuerySpy.callCount).to.equal(0);
      expect(makeQuerySpy.callCount).to.equal(0);

      let res = await getAdmissionRecordsSpy(query);

      expect(getAdmissionRecordsSpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.calledWith("SELECT * FROM Admission_record"));
      expect(makeQuerySpy.callCount).to.equal(1);

      expect(res.length).to.equal(0);

      getAdmissionRecordsSpy.restore();
    });

    it("getCurrentAdmissionRecords", async () => {
      let query = {};
      let getCurrentAdmissionRecordsSpy = spy(admissionRecordQueryManager, "getCurrentAdmissionRecords");

      expect(getCurrentAdmissionRecordsSpy.callCount).to.equal(0);
      expect(getBaseQuerySpy.callCount).to.equal(0);
      expect(makeQuerySpy.callCount).to.equal(0);

      const res = await getCurrentAdmissionRecordsSpy(query);

      expect(getCurrentAdmissionRecordsSpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.calledWith("SELECT * FROM Admission_record"));
      expect(makeQuerySpy.callCount).to.equal(1);

      expect(res.length).to.equal(0);

      getCurrentAdmissionRecordsSpy.restore();
    });

    it("updateAdmissionRecord", async () => {
      const data = {
        id: 1,
        patient_id: 3,
        patient_category: 1,
        admission_date: "2019-03-27",
        type_of_injury: "stroke",
      };
      let updateAdmissionRecordSpy = spy(admissionRecordQueryManager, "updateAdmissionRecord");
      let updateThenGetEntrySpy = spy(queryManager, "updateThenGetEntry");

      expect(updateAdmissionRecordSpy.callCount).to.equal(0);
      expect(updateThenGetEntrySpy.callCount).to.equal(0);

      const res = await updateAdmissionRecordSpy(data);

      expect(updateAdmissionRecordSpy.callCount).to.equal(1);
      expect(updateThenGetEntrySpy.callCount).to.equal(1);

      expect(res.length).to.equal(0);

      updateAdmissionRecordSpy.restore();
      updateThenGetEntrySpy.restore();
    });

    it("dischargeAdmissionRecordWithPatientId", async () => {
      let patient_id = 3;
      let dischargeAdmissionRecordWithPatientIdSpy = spy(admissionRecordQueryManager, "dischargeAdmissionRecordWithPatientId");

      expect(dischargeAdmissionRecordWithPatientIdSpy.callCount).to.equal(0);
      expect(makeQuerySpy.callCount).to.equal(0);

      let res = await dischargeAdmissionRecordWithPatientIdSpy(patient_id);

      expect(dischargeAdmissionRecordWithPatientIdSpy.callCount).to.equal(1);
      expect(makeQuerySpy.callCount).to.equal(1);

      dischargeAdmissionRecordWithPatientIdSpy.restore();
    });

    it("getCurrentRecordStmt", () => {
      const columns = [];

      let getCurrentRecordStmt = spy(admissionRecordQueryManager, "getCurrentRecordStmt");

      expect(getCurrentRecordStmt.callCount).to.equal(0);
      expect(getBaseQuerySpy.callCount).to.equal(0);

      let res = getCurrentRecordStmt(columns);

      expect(getCurrentRecordStmt.callCount).to.equal(1);
      expect(getBaseQuerySpy.callCount).to.equal(1);

      const expectedStatement = "SELECT * FROM `Admission_record`\n      WHERE discharge_date IS NULL OR discharge_date > '" + moment().format("YYYY-MM-DD") + "'";
      expect(res).to.deep.equal(expectedStatement);

      getCurrentRecordStmt.restore();
    });
  });

  describe('admissionRecordQueryManager after admission record is created', () => {
    before(async () => {
      // create user, patient, staff & record_id to mock admission record
      patientUserQuery = "INSERT INTO User values (1, '5678', 'samplepass4', 'jamie@test.com', '778-161-7181', 'Jamie', 'Jeon', 'Patient', 'Low', true);";
      staffUserQuery = "INSERT INTO User values (3, '1234', 'samplepass2', 'dennisyi@test.com', '778-891-0111', 'Dennis', 'Yi', 'Staff', 'Medium', true);";
      patientQuery = "INSERT INTO Patient values (1, '1234', 'somewhere over the rainbow', '778-303-1323', true, 'prog1', '1996-01-01');";
      staffQuery = "INSERT INTO Staff values (3, 'PT');";
      admissionRecordQuery = "INSERT INTO Admission_record values (1, 1, 3, '2018-02-01', '2018-03-01', 'brain injury', 'ayy lmao', NOW());";

      await db.query(patientUserQuery);
      await db.query(staffUserQuery);
      await db.query(patientQuery);
      await db.query(staffQuery);
      await db.query(admissionRecordQuery);
    });

    after((done) => {
      databaseCleaner.clean(db, done);
    });

    it("getAdmissionRecords", async () => {
      let query = {};
      let getAdmissionRecordsSpy = spy(admissionRecordQueryManager, "getAdmissionRecords");

      expect(getAdmissionRecordsSpy.callCount).to.equal(0);
      expect(getBaseQuerySpy.callCount).to.equal(0);
      expect(makeQuerySpy.callCount).to.equal(0);

      let res = await getAdmissionRecordsSpy(query);

      expect(getAdmissionRecordsSpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.callCount).to.equal(1);
      expect(getBaseQuerySpy.calledWith("SELECT * FROM Admission_record"));
      expect(makeQuerySpy.callCount).to.equal(1);

      expect(res.length).to.equal(1);

      getAdmissionRecordsSpy.restore();
    });
  })
});