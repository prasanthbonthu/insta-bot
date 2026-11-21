// Test 3: checks if the token from the "Generate token" button works.
// Run: node check-token.js
// It only READS your account name. Secret values are hidden in the output.

const TOKEN = process.env.ACCESS_TOKEN;
const IG_ID = process.env.MY_IG_ID || "17841436848430856";

if (!TOKEN) {
  console.log("No token found. Set ACCESS_TOKEN first (see the steps).");
  process.exit(1);
}

const hide = (key, value) => (/token/i.test(key) && typeof value === "string" ? "(hidden)" : value);

async function show(title, url) {
  try {
    const r = await fetch(url);
    const data = await r.json();
    console.log(`\n=== ${title}  (status ${r.status}) ===`);
    console.log(JSON.stringify(data, hide, 2));
  } catch (e) {
    console.log(`\n=== ${title} ===  error:`, e.message);
  }
}

(async () => {
  await show("A. graph.instagram.com  /me",
    `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${TOKEN}`);
  await show("B. graph.instagram.com  /your-id",
    `https://graph.instagram.com/v21.0/${IG_ID}?fields=username&access_token=${TOKEN}`);
  await show("C. graph.facebook.com  /your-id",
    `https://graph.facebook.com/v21.0/${IG_ID}?fields=username&access_token=${TOKEN}`);
})();