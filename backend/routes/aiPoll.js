const express = require('express');
const router = express.Router();
const { decideDriveLocation } = require('../services/aiPollService');

router.post('/poll-result', (req, res) => {
  const { pollResults } = req.body;

  if (!pollResults) {
    return res.status(400).json({ message: "Poll results missing" });
  }

  const result = decideDriveLocation(pollResults);
  res.json(result);
});

module.exports = router;
