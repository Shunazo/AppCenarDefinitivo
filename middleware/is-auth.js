module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn || !req.session.userId || !req.session.rol) {
      return res.redirect("/auth/login");
  }
  next();
};
