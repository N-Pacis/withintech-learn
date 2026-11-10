// Renders every assets/<course>/src/*.svg to assets/<course>/<name>.png.
// Run locally after editing a diagram (sharp comes from the web workspace):
//   node apps/api/scripts/draft-lessons/render-assets.cjs
// The PNGs are committed; the loader uploads them to S3 on --apply.

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

// sharp is installed as a dependency of next in the web workspace.
const webRequire = createRequire(path.resolve(__dirname, "../../../web/package.json"));
const nextRequire = createRequire(webRequire.resolve("next/package.json"));
const sharp = nextRequire("sharp");

const assetsRoot = path.join(__dirname, "assets");

(async () => {
  for (const course of fs.readdirSync(assetsRoot)) {
    const srcDir = path.join(assetsRoot, course, "src");
    if (!fs.existsSync(srcDir)) continue;
    for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith(".svg"))) {
      const out = path.join(assetsRoot, course, file.replace(/\.svg$/, ".png"));
      await sharp(path.join(srcDir, file), { density: 144 })
        .resize({ width: 1600 })
        .png({ compressionLevel: 9 })
        .toFile(out);
      console.log(`rendered ${path.relative(assetsRoot, out)}`);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
