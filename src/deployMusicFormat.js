const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');

const inputDirectory = './src/music/mp3';
const outputDirectory = './src/music';

if (!fs.existsSync(outputDirectory)) {
  console.log('NO EXISTE EL DIRECTORIO.');
}

console.log('Limpiando archivos OGG existentes...');

fs.readdirSync(outputDirectory).forEach(file => {
  if (path.extname(file).toLowerCase() === '.ogg') {
    const filePath = path.join(outputDirectory, file);
    fs.unlinkSync(filePath);
    console.log(`Archivo OGG eliminado: ${filePath}`);
  }
});

console.log('Limpieza terminada');
console.log('Iniciando conversión de archivos MP3 a OGG...');

fs.readdir(inputDirectory, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  let songCount = 1;

  files.forEach(file => {
    if (path.extname(file).toLowerCase() === '.mp3') {
      const inputFilePath = path.join(inputDirectory, file);
      const fileName = `${songCount.toString().padStart(3, '0')}_${path.parse(file).name}.ogg`;
      const outputFilePath = path.join(outputDirectory, fileName);

      console.log(`Convirtiendo canción ${file}.`);

      const command = `"${ffmpeg}" -i "${inputFilePath}" -c:a libopus -b:a 96k "${outputFilePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al convertir ${file}:`, stderr);
        } else {
          console.log(`Conversión de ${file} completa.`);
        }
      });

      songCount++;
    }
  });
});

