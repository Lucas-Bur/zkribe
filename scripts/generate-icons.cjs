// scripts/generate-icons.cjs
const path = require("path");
const fs = require("fs-extra");
const faviconsPkg = require("favicons"); // <- Paket
const sharp = require("sharp");

// favicons-Funktion extrahieren (kompatibel mit CJS/ESM)
const favicons =
  typeof faviconsPkg === "function"
    ? faviconsPkg
    : faviconsPkg.default || faviconsPkg.favicons;

if (typeof favicons !== "function") {
  throw new Error("favicons export not found. Check favicons version.");
}

const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const INPUT_SVG = path.join(PUBLIC_DIR, "logo.svg");
const OUT_DIR = PUBLIC_DIR;
const EXTRA_PNG_SIZES = [192, 512];

async function ensureInput() {
  const exists = await fs.pathExists(INPUT_SVG);
  if (!exists) throw new Error(`Input SVG nicht gefunden: ${INPUT_SVG}`);
}

async function generateFavicons() {
  const configuration = {
    path: "/",
    appName: "Create TanStack App Sample",
    appShortName: "TanStack App",
    appDescription: "PWA assets generated from SVG",
    background: "#0d0a0b",
    theme_color: "#e26d00",
    display: "standalone",
    icons: {
      android: false,
      appleIcon: false,
      appleStartup: false,
      favicons: true,
      windows: false,
      yandex: false,
      firefox: false,
      coast: false
    }
  };

  const { images, files, html } = await favicons(INPUT_SVG, configuration);

  for (const file of [...images, ...files]) {
    await fs.outputFile(path.join(OUT_DIR, file.name), file.contents);
  }

  console.log("Favicons/Manifest generiert.");
  if (html?.length) console.log(html.join("\n"));
}

async function generateExtraPngs() {
  for (const size of EXTRA_PNG_SIZES) {
    await sharp(INPUT_SVG)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `logo${size}.png`));
  }
  console.log(`Extra PNGs: ${EXTRA_PNG_SIZES.join(", ")}`);
}

async function main() {
  await ensureInput();
  await generateFavicons();
  await generateExtraPngs();
  console.log("Alles fertig in /public.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});