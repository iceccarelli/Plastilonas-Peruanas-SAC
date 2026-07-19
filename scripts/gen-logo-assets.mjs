import sharp from 'sharp';
const SRC = 'plastilonas_peruanas_logo.jpg';          // 784x1168 source in repo root
const crop = { left: 126, top: 319, width: 533, height: 533 };  // tight square around the monogram
for (const [out, size] of [['public/logo.png',256],['app/icon.png',256],['app/apple-icon.png',180]]) {
  await sharp(SRC).extract(crop).resize(size, size).png().toFile(out);
  console.log('wrote', out, size + 'x' + size);
}
