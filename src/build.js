// Собирает один автономный HTML-файл: node src/build.js
const fs = require("fs"), path = require("path");
const dir = __dirname;
const tpl = fs.readFileSync(path.join(dir, "template.html"), "utf8");
const logic = fs.readFileSync(path.join(dir, "logic.js"), "utf8").replace(/^if \(typeof module.*$/m, "");
const data = fs.readFileSync(path.join(dir, "nouns.js"), "utf8");
const out = tpl.replace("/*LOGIC*/", () => logic).replace("/*DATA*/", () => data);
const dst = path.join(dir, "..", "Латынь_III_склонение.html");
fs.writeFileSync(dst, out);
fs.writeFileSync(path.join(dir, "..", "index.html"), out);
console.log("OK", dst, (out.length / 1024).toFixed(1) + " KB");
