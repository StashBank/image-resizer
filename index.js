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

const imageFiles = files
  .filter(fileName => /jpg$|jpeg$|png$/i.test(fileName))
  .map(file => path.join(inputDir, file));

const prom = new Promise((resolve, reject) => {

const queue = [];

function resize(path, width, height, outputPath) {
  sharp(path)
    .resize(width, height)
    .toFile(outputFilePath, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        //fs.writeFileSync(outputFilePath, data);
        queue.splice(queue.findIndex(x => x === outputFilePath));
        console.log(`Processed ${outputPath}`);
        if (queue.length === 0) {
          resolve();
        }
      }
    });
}

imageFiles.forEach(imagePath => targetResolutions
    .map(x => x.split('x').map(v => +v))
    .forEach(resolution => {
      const [width, height] = resolution;
      const fileInfo = path.parse(imagePath);
      const outputFileName = `${fileInfo.name}_${width}x${height}${fileInfo.ext}`;
      outputFilePath = path.join(outputDir, outputFileName);
      resize(imagePath, width, height, outputFilePath);
      queue.push(outputFilePath);
    })
);

});
await prom;

}

process();