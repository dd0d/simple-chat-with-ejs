const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.get("/chat/:username", async (req, res) => {
  const me = req.session.user;
  const other = req.params.username;

  const messages = await Message.find({
    $or: [
      { from: me, to: other },
      { from: other, to: me }
    ]
  });

  res.render("chat/chat", { other, messages });
});

router.post("/chat/:username", async (req, res) => {
  await Message.create({
    from: req.session.user,
    to: req.params.username,
    text: req.body.message
  });

  res.redirect("/chat/" + req.params.username);
});

module.exports = router;
