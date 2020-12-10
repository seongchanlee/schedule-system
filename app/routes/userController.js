const routes = require('express').Router();
const userManager = require("@app/helpers/queryManager/user");

routes.get("/", async (req, res) => {
  try {
    const result = await userManager.getAllOngoingUsers(req.query);
    res.status(200);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

routes.get("/:user_id", async (req, res) => {
  try {
    const result = await userManager.getUserWithId(req.params.user_id)
    if (result.length === 0) {
      return res.status(404)
        .json({ message: `User with id = ${req.params.user_id} does NOT exist`});
    }
    res.status(200);
    res.send(result[0]);
  } catch (err) {
    res.status(500).json(err);
  };
});

routes.put("/:user_id", (req, res) => {
  userManager.updateUserWithId(req.params.user_id, req.body)
    .then(result => {
      if (result.length === 0)
        return res.sendStatus(404);
      res.status(200);
      res.send(result[0]);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

routes.delete("/:user_id", async (req, res) => {
  try {
    const aCancelledAppointments = await userManager.softDeleteUserWithId(req.params.user_id);
    res.status(204);
    res.send(aCancelledAppointments);
  } catch (err) {
    // console.log(err);
    res.status(500).json({ message: `Something went wrong` });
  }
});

module.exports = routes;
