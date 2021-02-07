const fs = require('fs'),
  path = require('path'),
  sharp = require('sharp'),
  config = require('./config.json');

const process = async () => {
const { inputDir, outputDir, targetResolutions } = config;

const files = fs.readdirSync(inputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function resize(path, width, height, outputPath) {
  return new Promise((resolve, reject) => {

    sharp(path)
      .resize(width, height)
      .toFile(outputFilePath, (error, data) => {
        if (error) {
          reject(error);
        } else {
          console.log(`Processed ${outputPath}`);
          resolve();
        }
      });
  })
}

const imageFiles = files
  .filter(fileName => /jpg$|jpeg$|png$/i.test(fileName))
  .map(file => path.join(inputDir, file));

const prom = Promise.all(
  imageFiles.map(imagePath => targetResolutions
    .map(x => x.split('x').map(v => +v))
    .map(async resolution => {
      const [width, height] = resolution;
      const fileInfo = path.parse(imagePath);
      const outputFileName = `${fileInfo.name}_${width}x${height}${fileInfo.ext}`;
      outputFilePath = path.join(outputDir, outputFileName);
      await resize(imagePath, width, height, outputFilePath);
    })
));

await prom;

}

process();