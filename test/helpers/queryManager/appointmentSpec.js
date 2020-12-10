describe('appointmentQueryManager unit test', () => {
  let appointmentQueryManager;
  let queryManager;

  before(() => {
    appointmentQueryManager = require('@app/helpers/queryManager/appointment');
    queryManager = require('@app/helpers/queryManager');
  });

  describe("before appointments are created", () => {
    it("getAppointmentFromId the appointment doesn't exist", async () => {
      const id = 1;
      let getAppointmentFromIdSpy = spy(appointmentQueryManager, "getAppointmentFromId");
      expect(getAppointmentFromIdSpy.callCount).to.equal(0);

      const res = await getAppointmentFromIdSpy(id);

      expect(getAppointmentFromIdSpy.callCount).to.equal(1);
      expect(res.length).to.equal(0);
      getAppointmentFromIdSpy.restore();
    });

    it("softDeleteAppointmentWithId", async () => {
      const id = 1;
      let softDeleteAppointmentWithIdSpy = spy(appointmentQueryManager, "softDeleteAppointmentWithId");
      let softDeleteEntrySpy = spy(queryManager, "softDeleteEntry");
      expect(softDeleteAppointmentWithIdSpy.callCount).to.equal(0);
      expect(softDeleteEntrySpy.callCount).to.equal(0);

      const res = await softDeleteAppointmentWithIdSpy(id);

      expect(softDeleteAppointmentWithIdSpy.callCount).to.equal(1);
      expect(softDeleteEntrySpy.callCount).to.equal(1);
      expect(res.affectedRows).to.equal(0);
      softDeleteAppointmentWithIdSpy.restore();
      softDeleteEntrySpy.restore();
    });

    it("revertSoftDeleteAppointmentWithId", async () => {
      const id = 1;
      let revertSoftDeleteAppointmentWithIdSpy = spy(appointmentQueryManager, "revertSoftDeleteAppointmentWithId");
      let softDeleteEntrySpy = spy(queryManager, "softDeleteEntry");
      expect(revertSoftDeleteAppointmentWithIdSpy.callCount).to.equal(0);
      expect(softDeleteEntrySpy.callCount).to.equal(0);

      const res = await revertSoftDeleteAppointmentWithIdSpy(id);

      expect(revertSoftDeleteAppointmentWithIdSpy.callCount).to.equal(1);
      expect(softDeleteEntrySpy.callCount).to.equal(1);
      expect(res.affectedRows).to.equal(0);

      revertSoftDeleteAppointmentWithIdSpy.restore();
      softDeleteEntrySpy.restore();
    });

    it("user with id= 6 type= 'Staff' should return result length of 0", async () => {
      const id = 6, type = "Staff";
      let getAppointmentAccordingToUserSpy = spy(appointmentQueryManager, "getAppointmentAccordingToUser");
      expect(getAppointmentAccordingToUserSpy.callCount).to.equal(0);

      const res = await getAppointmentAccordingToUserSpy(id, type);
      expect(res.length).to.equal(0);
      expect(getAppointmentAccordingToUserSpy.callCount).to.equal(1);

      getAppointmentAccordingToUserSpy.restore();
    });

    it("user with id= -1 type= '' should return result length of 0", async () => {
      const id = -1, type = "";
      const res = await appointmentQueryManager.getAppointmentAccordingToUser(id, type);
      expect(res.length).to.equal(0);
    });
  });

  describe("createAppointment and test the get functions", function() {
    before(async () => {
      // create user, patient, staff & record_id to mock appointment
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

    it("createAppointment", async () => {
      const data = {
        "id": 1,
        "patient_id": 1,
        "staff_id": 3,
        "record_id": 1,
        "type_of_therapy": "type2",
        "patient_category": 1,
        "start_date": "2019-01-02",
        "start_time": "12:30:00",
        "end_time": "14:00:00",
        "repetition": "none",
        "is_cancelled": false,
        "is_attend": false
      };
      let createAppointmentSpy = spy(appointmentQueryManager, "createAppointment");
      let createThenGetEntrySpy = spy(queryManager, "createThenGetEntry");
      expect(createAppointmentSpy.callCount).to.equal(0);
      expect(createThenGetEntrySpy.callCount).to.equal(0);

      const res = await createAppointmentSpy(data);

      expect(createAppointmentSpy.callCount).to.equal(1);
      expect(createThenGetEntrySpy.callCount).to.equal(1);
      expect(res.length).to.equal(1);

      createAppointmentSpy.restore();
      createThenGetEntrySpy.restore();
    });

    it("getAppointmentFromId", async () => {
      const id = 1;
      let getAppointmentFromIdSpy = spy(appointmentQueryManager, "getAppointmentFromId");
      expect(getAppointmentFromIdSpy.callCount).to.equal(0);

      const res = await getAppointmentFromIdSpy(id);

      expect(getAppointmentFromIdSpy.callCount).to.equal(1);
      expect(res.length).to.equal(1);
      getAppointmentFromIdSpy.restore();
    });

    it("getAppointmentAccordingToUser", async () => {
      const id = 3, type = "Staff";
      let getAppointmentAccordingToUserSpy = spy(appointmentQueryManager, "getAppointmentAccordingToUser");
      expect(getAppointmentAccordingToUserSpy.callCount).to.equal(0);

      const res = await getAppointmentAccordingToUserSpy(id, type);
      expect(res.length).to.equal(1);
      expect(getAppointmentAccordingToUserSpy.callCount).to.equal(1);

      getAppointmentAccordingToUserSpy.restore();
    });

    it("softDeleteAppointmentWithId", async () => {
      const id = 1;
      let softDeleteAppointmentWithIdSpy = spy(appointmentQueryManager, "softDeleteAppointmentWithId");
      let softDeleteEntrySpy = spy(queryManager, "softDeleteEntry");
      expect(softDeleteAppointmentWithIdSpy.callCount).to.equal(0);
      expect(softDeleteEntrySpy.callCount).to.equal(0);

      const res = await softDeleteAppointmentWithIdSpy(id);

      expect(softDeleteAppointmentWithIdSpy.callCount).to.equal(1);
      expect(softDeleteEntrySpy.callCount).to.equal(1);
      expect(res.affectedRows).to.equal(1);
      softDeleteAppointmentWithIdSpy.restore();
      softDeleteEntrySpy.restore();
    });

    it("revertSoftDeleteAppointmentWithId", async () => {
      const id = 1;
      let revertSoftDeleteAppointmentWithIdSpy = spy(appointmentQueryManager, "revertSoftDeleteAppointmentWithId");
      let softDeleteEntrySpy = spy(queryManager, "softDeleteEntry");
      expect(revertSoftDeleteAppointmentWithIdSpy.callCount).to.equal(0);
      expect(softDeleteEntrySpy.callCount).to.equal(0);

      const res = await revertSoftDeleteAppointmentWithIdSpy(id);

      expect(revertSoftDeleteAppointmentWithIdSpy.callCount).to.equal(1);
      expect(softDeleteEntrySpy.callCount).to.equal(1);
      expect(res.affectedRows).to.equal(1);

      revertSoftDeleteAppointmentWithIdSpy.restore();
      softDeleteEntrySpy.restore();
    });
  });
});
