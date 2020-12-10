const { users } = require('@test/fixtures/userControllerSpecMockData');
const userManager = require('@app/helpers/queryManager/user');

describe("userController Unit Tests", () => {

  describe("get '/api/users'", () => {
    let getAllOngoingUsers;

    before(() => {
      getAllOngoingUsersStub = stub(userManager, "getAllOngoingUsers").resolves(users);
    });

    after(() => {
      userManager.getAllOngoingUsers.restore();
    });

    it("expect res to be length 7 and status 200", async () => {
      const res = await chai.request(server).get("/api/users");
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(users.length);
      expect(res.body).to.deep.equal(users);
      expect(getAllOngoingUsersStub.callCount).to.equal(1);
    });
  });

  describe("get '/api/users/:user_id'", () => {
    let getUserWithIdStub;

    it("expect res body to hold one user object and status 200", async () => {
      getUserWithIdStub = stub(userManager, "getUserWithId").resolves([users[0]]);

      const res = await chai.request(server).get("/api/users/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(users[0]);
      expect(getUserWithIdStub.callCount).to.equal(1);

      userManager.getUserWithId.restore();
    });

    it("expect status of 404 and a message object with 'User with id = {user_id} does NOT exist'", async () => {
      const mockId = 123;
      getUserWithIdStub = stub(userManager, "getUserWithId").resolves([]);

      const res = await chai.request(server).get(`/api/users/${mockId}`);
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal(`User with id = ${mockId} does NOT exist`);
      expect(getUserWithIdStub.callCount).to.equal(1);

      userManager.getUserWithId.restore();
    });
  });

  describe("post '/api/users'", () => {
    //TODO: write unit test after temporary solution for password is resolved.
  });

  describe("put '/api/users/:user_id'", () => {
    let updateUserWithIdStub;

    it("updateUserWithId should be called with correct arguments", async () => {
      const mockRequestBody = { foo: "fooTest", bar: "barTest"};
      updateUserWithIdStub = stub(userManager, "updateUserWithId").resolves([users[2]]);

      const res = await chai.request(server)
        .put(`/api/users/${users[2].id}`)
        .set('content-type', 'application/json')
        .send(mockRequestBody);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(updateUserWithIdStub.callCount).to.equal(1);
      expect(updateUserWithIdStub.getCall(0).args[0]).to.equal(`${users[2].id}`);
      expect(updateUserWithIdStub.getCall(0).args[1]).to.deep.equal(mockRequestBody);

      userManager.updateUserWithId.restore();
    });

    it("res status should be 404", async () => {
      updateUserWithIdStub = stub(userManager, "updateUserWithId").resolves([]);

      const res = await chai.request(server)
        .put('/api/users/123')
        .set('content-type', 'application/json')
        .send({});

      expect(res.status).to.equal(404);
    });
  });

  describe("delete '/api/users/:user_id'", () => {
    let softDeleteUserWithIdStub;

    it("two affected rows should return status of 204", async () => {
      const mockResult = { affectedRows: 2 };
      softDeleteUserWithIdStub = stub(userManager, "softDeleteUserWithId").resolves(mockResult);

      const res = await chai.request(server)
        .del('/api/users/123123')
        .set('content-type', 'application/json');

      expect(res.status).to.equal(204);
      expect(res.body).to.deep.equal({});
      expect(softDeleteUserWithIdStub.callCount).to.equal(1);

      userManager.softDeleteUserWithId.restore();
    });

    // commented out as warning message appears
    // it("zero affected rows should return status of 404", async () => {
    //   const mockResult = { affectedRows: 0 };
    //   softDeleteUserWithIdStub = stub(userManager, "softDeleteUserWithId").resolves(mockResult);

    //   const res = await chai.request(server)
    //     .del('/api/users/321312')
    //     .set('content-type', 'application/json');

    //   expect(res.status).to.equal(404);
    //   expect(res.body).to.deep.equal({});
    //   expect(softDeleteUserWithIdStub.callCount).to.equal(1);

    //   userManager.softDeleteUserWithId.restore();
    // });
  });
});