const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/search", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const users = await User.find({
    username: { $regex: req.query.q || "", $options: "i" },
    username: { $ne: req.session.user }
  });

  res.render("search", { users });
});

module.exports = router;
