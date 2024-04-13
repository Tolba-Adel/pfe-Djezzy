const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

function authRole(role) {
  return (req, res, next) => {
    if (req.session.user.role !== role) {
      res.status(403).render("forbidden");
    }
    next();
  };
}

module.exports = {
  ROLES,
  authRole,
};
