const routes = require('express').Router();
const userManager = require("@app/helpers/queryManager/user");
const staffManager = require("@app/helpers/queryManager/staff");
const db = require("@config/db/connection").connectDatabase();

routes.get("/", (req, res) => {
  staffManager.getActiveStaffs(req.query)
    .then(result => {
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

routes.get("/:staff_id", async (req, res) => {
  const { staff_id } = req.params;
  try {
    const staff = await staffManager.getStaffWithId(staff_id);
    if (staff.length !== 1) {
      if (staff.length === 0) {
        // TODO: better error message using MessageUtils
        res.status(404);
        return res.send("Staff does not exist");
      } else {
        // TODO: better message
        throw new Error("your database is messed up");
      }
    }
    res.status(200);
    return res.send(staff[0]);
  } catch(e) {
    res.status(500).json(e);
  }
});


routes.post("/", async (req, res) => {
  await db.beginTransaction();
  try {
    const userCheckResult = await userManager.UNSAFE_getInactiveUserWithUsername(req.body.User.email);
    if (userCheckResult.length === 0) {
      const userData = Object.assign({...req.body.User}, { username: req.body.User.email });
      const user = await userManager.createUser(userData);
      const staffData = Object.assign({...req.body.Staff}, { id: user[0].id });
      const staff = await staffManager.createStaff(staffData);
      await db.commit();
      res.status(200);
      res.send({
        User: user[0],
        Staff: staff[0]
      });
    } else if (userCheckResult[0].type === "Staff") {
      _updateStaff(req, res, userCheckResult[0].id, true);
    } else {
      throw {message: "User with requested email already exists in the system as different user type. Please consult system administrator."};
    }
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
});

routes.put("/:staff_id", async (req, res) => {
  const { staff_id } = req.params;
  await _updateStaff(req, res, staff_id);
});

routes.delete("/:staff_id", async (req, res) => {
  const { staff_id } = req.params;
  await db.beginTransaction();
  try {
    userManager.softDeleteUserWithId(staff_id);
    await db.commit();
    res.sendStatus(204);
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
});

async function _updateStaff(req, res, id, isReactivate) {
  await db.beginTransaction();
  try {
    const userData = Object.assign({...req.body.User}, { username: req.body.User.email, active: isReactivate || req.body.User.active });
    const user = await userManager.updateUserWithId(id, userData, isReactivate);
    const staff = await staffManager.updateStaffWithId(id, req.body.Staff);
    await db.commit();
    res.status(200);
    res.send({
      User: user[0],
      Staff: staff[0]
    });
  } catch(e) {
    await db.rollback();
    res.status(500).json(e);
  }
}

module.exports = routes;
