const routes = require('express').Router();
const admissionRecordManager = require("@app/helpers/queryManager/admissionRecord");

routes.get("/", (req, res) => {
  admissionRecordManager.getAdmissionRecords(req.query)
    .then(result => {
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

routes.get("/current", (req, res) => {
  admissionRecordManager.getCurrentAdmissionRecords(req.query)
    .then(result => {
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

routes.get("/:record_id", (req, res) => {
  admissionRecordManager.getAdmissionRecords(req.params.record_id)
    .then(result => {
      if (result.length === 0) {
        res.status(404)
          .json({ message: `User with id = ${req.params.user_id} does NOT exist`});
      }
      res.status(200);
      res.send(result[0]);
    }).catch(err => {
      res.status(500).json(err);
    });
});

routes.post("/", (req, res) => {
  admissionRecordManager.createAdmissionRecord(req.body.admissionRecord)
    .then(result => {
      if (result.length === 0)
        throw new Error();
      res.status(200);
      res.send(result);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

routes.delete("/:record_id", (req, res) => {

});


module.exports = routes;
