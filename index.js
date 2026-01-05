import express from "express";

const app = express();
app.use(express.json());

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;

// Replace with YOUR Solana wallet
const PAY_TO = "YOUR_SOLANA_WALLET_ADDRESS";

// USDC on Solana
const USDC_SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// ===== x402 ENDPOINT =====
app.post("/x402/solana/schedoputer", (req, res) => {
  // IMPORTANT: payment check must come FIRST
  const paymentHeader = req.headers["x-payment"];

  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: 1,
      accepts: [
        {
          scheme: "exact",
          network: "solana",
          maxAmountRequired: "10000", // $0.01 USDC (6 decimals)
          asset: USDC_SOLANA,
          payTo: "4n9vJHPezhghfF6NCTSPgTbkGoV7EsQYtC2hfaKfrM8U" ,
          resource: "https://schedoputer.onrender.com/x402/solana/schedoputer"
        }
      ]
    });
  }

  // For now: just acknowledge payment
  return res.json({
    success: true,
    message: "Schedoputer payment accepted (logic coming next)"
  });
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Schedoputer is alive");
});

app.listen(PORT, () => {
  console.log(`Schedoputer running on port ${PORT}`);
});
