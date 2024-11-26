module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
      req.flash("errors", "No estás autorizado para acceder a esta sección.");
      return res.redirect("/auth/login");
  }
  next();
};
