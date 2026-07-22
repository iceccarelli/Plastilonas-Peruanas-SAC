#!/usr/bin/env node
/**
 * IndexNow — Bing, Yandex, Seznam, Naver, Yep only.
 * Google does NOT support IndexNow (use sitemaps + GSC). No Google Indexing API
 * here — it is restricted to JobPosting/BroadcastEvent and misuse risks revocation.
 * Requires env INDEXNOW_KEY (also host <key>.txt at site root) and SITE_URL.
 */
const KEY = process.env.INDEXNOW_KEY;
const HOST = (process.env.SITE_URL || "https://plastilonas-peruanas-sac.vercel.app").replace(/\/$/, "");
if (!KEY) { console.error("Missing INDEXNOW_KEY"); process.exit(1); }
const urls = process.argv.slice(2);
if (!urls.length) { console.log("No URLs passed; nothing to submit."); process.exit(0); }
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(HOST).host, key: KEY, keyLocation: `${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log("IndexNow status:", res.status);
