const routes = require('express').Router();
const em = require("@app/helpers/emailManager");

routes.get("/", (req, res) => {
  em.sendMail();
  res.status(200);
  res.send({data: "knkn"});
});

routes.get("/:id", (req, res) => {
  res.status(200);
  res.send({data: `Hello, ${req.params.id}`});
});

module.exports = routes;