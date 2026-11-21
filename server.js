// Instagram birthday auto-reply bot (Node.js 18+)
// Install: npm install express
// Run:     node server.js

const express = require("express");
const app = express();
app.use(express.json());

// ---- Settings (put these in environment variables, not in code) ----
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;   // any secret word you choose
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;   // Instagram access token from Meta app
const MY_IG_ID = process.env.MY_IG_ID;           // your Instagram account ID
// Your token works with graph.facebook.com (we tested this)
const API = "https://graph.facebook.com/v21.0";

// Words that mean "birthday wish"
const BIRTHDAY_REGEX = /(birthday|bday|b'day|hbd|many many returns|janmadin)/i;

// Different replies so it does not look like spam
const REPLIES = [
  "Thank you so much! 😊",
  "Thanks a lot! 🎉",
  "Thank you! Really appreciate it 😊",
  "Thanks for the wishes! ❤️",
];
const randomReply = () => REPLIES[Math.floor(Math.random() * REPLIES.length)];

// ---- Step 1: Meta checks your webhook URL with this GET request ----
app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

// ---- Step 2: Meta sends new comments and messages here ----
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // reply to Meta quickly
  console.log("Got event:", JSON.stringify(req.body));

  try {
    for (const entry of req.body.entry || []) {
      // Comments on your posts
      for (const change of entry.changes || []) {
        if (change.field === "comments") {
          const c = change.value;
          if (c.from?.id === MY_IG_ID && process.env.TEST_SELF !== "1") continue; // do not reply to yourself (unless testing)
          if (BIRTHDAY_REGEX.test(c.text || "")) {
            await replyToComment(c.id);
          }
        }
      }
      // Direct messages
      for (const m of entry.messaging || []) {
        const text = m.message?.text;
        if (!text || m.message.is_echo) continue; // skip your own messages
        if (BIRTHDAY_REGEX.test(text)) {
          await replyToDM(m.sender.id);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
});

async function replyToComment(commentId) {
  const r = await fetch(`${API}/${commentId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ message: randomReply() }),
  });
  console.log("Comment reply:", r.status, await r.text());
}

async function replyToDM(userId) {
  const r = await fetch(`${API}/${MY_IG_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      recipient: { id: userId },
      message: { text: randomReply() },
    }),
  });
  console.log("DM reply:", r.status, await r.text());
}

app.listen(3000, () => console.log("Bot running on port 3000"));