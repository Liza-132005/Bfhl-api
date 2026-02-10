const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});


const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a, b) => (a * b) / gcd(a, b);

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);


    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let data;

    if (key === "fibonacci") {
      const n = body[key];
      if (typeof n !== "number" || n < 0) {
        throw new Error("Invalid fibonacci input");
      }

      let fib = [0, 1];
      for (let i = 2; i < n; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      data = fib.slice(0, n);
    }


    else if (key === "prime") {
      if (!Array.isArray(body[key])) {
        throw new Error("Invalid prime input");
      }
      data = body[key].filter(isPrime);
    }


    else if (key === "lcm") {
      if (!Array.isArray(body[key]) || body[key].length === 0) {
        throw new Error("Invalid lcm input");
      }
      data = body[key].reduce((acc, val) => lcm(acc, val));
    }


    else if (key === "hcf") {
      if (!Array.isArray(body[key]) || body[key].length === 0) {
        throw new Error("Invalid hcf input");
      }
      data = body[key].reduce((acc, val) => gcd(acc, val));
    }


    else if (key === "AI") {
  const question = body[key];

  if (typeof question !== "string" || question.trim() === "") {
    throw new Error("Invalid AI input");
  }

  try {
    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: question }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    const text =
      aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

    data = text?.trim().split(/\s+/)[0] || "AI";

  } catch (err) {
    data = "AI";
  }
}



    else {
      throw new Error("Invalid key");
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      is_success: false,
      official_email: EMAIL,
      error: error.message
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
