const checkSession = (req, res, next) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  next();
};
const unlessPathInclude = (paths, middleware) => (req, res, next) => {
  if (paths.some(path => req.path.match(path))) {
    return next();
  }
  return middleware(req, res, next);
};
module.exports = whiteList => unlessPathInclude(whiteList, checkSession);