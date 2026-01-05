import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const jobs = new Map();

const PRICE = 10000; // 0.01 USDC (6 decimals)

app.post("/x402/solana/schedoputer", (req, res) => {
  // 1️⃣ x402 discovery
  if (!req.headers["x-payment"]) {
    return res.status(402).json({
      x402Version: 1,
      accepts: [{
        scheme: "exact",
        network: "solana",
        maxAmountRequired: String(PRICE),
        asset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        payTo: "4n9vJHPezhghfF6NCTSPgTbkGoV7EsQYtC2hfaKfrM8U",
        resource: "https://schedoputer.onrender.com/x402/solana/schedoputer"
      }]
    });
  }

  const { action, scheduleAfterMinutes, jobPlan, jobRef } = req.body;

  // 2️⃣ Handle actions
  if (action === "schedule") {
    if (!scheduleAfterMinutes || !jobPlan) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const id = crypto.randomUUID();
    const scheduledFor = new Date(
      Date.now() + scheduleAfterMinutes * 60 * 1000
    );

    jobs.set(id, {
      id,
      state: "scheduled",
      scheduledFor,
      jobPlan
    });

    return res.json({
      success: true,
      schedoputerJobId: id,
      state: "scheduled",
      scheduledFor,
      costCharged: 0.01
    });
  }

  if (action === "undo") {
    const job = jobs.get(jobRef);
    if (!job || job.state !== "scheduled") {
      return res.status(400).json({ error: "Invalid job" });
    }

    job.state = "cancelled";

    return res.json({
      success: true,
      schedoputerJobId: jobRef,
      state: "cancelled",
      costCharged: 0.01
    });
  }

  if (action === "modify") {
    const job = jobs.get(jobRef);
    if (!job || job.state !== "scheduled") {
      return res.status(400).json({ error: "Invalid job" });
    }

    if (scheduleAfterMinutes) {
      job.scheduledFor = new Date(
        Date.now() + scheduleAfterMinutes * 60 * 1000
      );
    }

    if (jobPlan) {
      job.jobPlan = jobPlan;
    }

    return res.json({
      success: true,
      schedoputerJobId: jobRef,
      state: "modified",
      scheduledFor: job.scheduledFor,
      costCharged: 0.01
    });
  }

  res.status(400).json({ error: "Unknown action" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Schedoputer running"));
