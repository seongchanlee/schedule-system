const { staffs, patients, appointments, expectedResult } = require('@test/fixtures/appointmentControllerSpecMockData');
const appointmentManager = require('@app/helpers/queryManager/appointment');

describe("appointmentController Unit Tests", () => {

  describe("get '/api/appointments/?user_id= unit tests", () => {
    let getUserWithIdFromTableStub, getAppointmentAccordingToUserStub;

    before(() => {
      getAppointmentAccordingToUserStub = stub(appointmentManager, "getAppointmentAccordingToUser").resolves(appointments);
      getUserWithIdFromTableStub = stub(appointmentManager, "getUserWithIdFromTable").resolves(staffs);

    });

    after(() => {
      appointmentManager.getUserWithIdFromTable.restore();
      appointmentManager.getAppointmentAccordingToUser.restore();
    });

    // TODO: Temporarily disabled due to ongoing changes in API and DB
    xit("user type 'Staff' expect res to be length 2 and status 200", async () => {
      let res = await chai.request(server)
        .get("/api/appointments")
        .query({user_id: 6});

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(expectedResult);

      expect(getAppointmentAccordingToUserStub.callCount).to.equal(1);
      expect(getUserWithIdFromTableStub.callCount).to.equal(1);
    });

    // it("expect correct error message")
  });
});