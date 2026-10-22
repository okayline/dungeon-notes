import fs from "node:fs";
const strip = (f) => fs.readFileSync(f, "utf8").replace(/^export /gm, "");
const root = "/home/claude/moba-beat/public/samples/";
const b64 = {};
for (const k of fs.readdirSync(root)) {
  if (k === "cue.wav") { b64.cue = fs.readFileSync(root + k).toString("base64"); continue; }
  if (!fs.statSync(root + k).isDirectory()) continue;
  b64[k] = {};
  for (const f of fs.readdirSync(root + k)) b64[k][f.replace(".wav", "")] = fs.readFileSync(root + k + "/" + f).toString("base64");
}
let t = fs.readFileSync("tpl.html", "utf8");
t = t.replace("/*BEAT*/", () => strip("/home/claude/moba-beat/public/beat.js")).replace("/*ENGINE*/", () => strip("engine.mjs"))
  .replace("/*SAMPLES*/", () => JSON.stringify(b64));
fs.writeFileSync("playtest.html", t);
fs.writeFileSync("playtest.js", t.slice(t.indexOf('<script type="module">') + 22, t.lastIndexOf("</script>")));
console.log(t.length);
