const routes = require("express").Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userManager = require("@app/helpers/queryManager/user");
const staffManager = require("@app/helpers/queryManager/staff");
const bcrypt = require("bcrypt");

passport.serializeUser(({ username }, done) => done(null, username));
passport.deserializeUser((username, done) =>
  userManager.getUserWithUsername(username)
    .then(result => {
      if (result.length === 0) {
        return done(null, false, { message: "User does NOT exist. "})
      }
      const currentUser = result[0];
      if (currentUser.type === "Staff") {
        staffManager.getStaffWithId(currentUser.id)
          .then(res => {
            if (res.length === 0)
              return done(err, null, { message: "Database is in trouble"});
            return done(null, Object.assign({...currentUser}, {therapist_type: res[0].Staff.therapist_type}));
          })
          .catch(err => done(err, null, { message: "Database is in trouble"}));
      } else {
        return done(null, currentUser);
      }
    })
    .catch(err => done(err, null, { message: "User does NOT exist."}))
);

passport.use(new LocalStrategy((username, password, done) => {
  userManager.getUserWithUsername(username, true)
    .then(result => {
      if (result.length === 0) {
        return done(null, false, { field: "username", message: "The username you’ve entered doesn’t match any account."});
      }
      if (process.env.NODE_ENV === "production") {
        bcrypt.compare(password, result[0].password)
          .then(res => {
            if (res) {
              const currentUser = result[0];
              delete currentUser.password;
              if (currentUser.type === "Staff") {
                staffManager.getStaffWithId(currentUser.id)
                  .then(res => {
                    if (res.length === 0)
                      return done(err, null, { message: "Database is in trouble"});
                    return done(null, Object.assign({...currentUser}, {therapist_type: res[0].Staff.therapist_type}));
                  })
                  .catch(err => done(err, null, { message: "Database is in trouble"}));
              } else {
                return done(null, currentUser);
              }
            } else {
              return done(null, false, { field: "password", message: "The password you’ve entered is incorrect."});
            }
          })
          .catch(err => { throw err; });
      } else {
        if (password === result[0].password) {
          const currentUser = result[0];
          delete currentUser.password;
          if (currentUser.type === "Staff") {
            staffManager.getStaffWithId(currentUser.id)
              .then(res => {
                if (res.length === 0)
                  return done(err, null, { message: "Database is in trouble"});
                return done(null, Object.assign({...currentUser}, {therapist_type: res[0].Staff.therapist_type}));
              })
              .catch(err => done(err, null, { message: "Database is in trouble"}));
          } else {
            return done(null, currentUser);
          }
        } else {
          return done(null, false, { field: "password", message: "The password you’ve entered is incorrect."});
        }
      }
    })
    .catch(err => done(err));
  })
);

routes.get("/", (req, res) => {
  if (!req.user) {
    res.sendStatus(404);
  } else {
    res.status(200);
    res.send(req.user);
  }
});

routes.post("/", (req, res, next) => {
  passport.authenticate('local', { session: true } , (err, user, info) => {
    if (err) { return res.status(500).json(err) }
    if (!user) { return res.status(401).json( { field: info.field, message: info.message }) }
    req.login(user, err => {
      if (err) return res.status(500).json(err);
      res.send(user);
    });
  })(req, res, next);
});

routes.delete("/", (req, res) => {
  try {
    req.session = null;
    req.logout();
    res.sendStatus(204);
  } catch (e) {
    res.status(500);
    res.send(e);
  }
});

module.exports = routes;