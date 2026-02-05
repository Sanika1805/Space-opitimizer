// const express = require("express");
// const router = express.Router();
// const { predictPriority } = require("../services/aiService");

// router.post("/priority", async (req, res) => {
//   try {
//     const result = await predictPriority(req.body);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { getPriority } = require("../services/aiService");

router.post("/priority", async (req, res) => {
  try {
    const result = await getPriority(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "AI service failed" });
  }
});

module.exports = router;
