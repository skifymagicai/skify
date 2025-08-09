// server/routes/job.js
const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const jobs = global.__SKIFY_JOBS || {};
  const job = jobs[id];
  if(!job) return res.status(404).json({ message: "job not found" });
  res.json(job);
});

module.exports = router;