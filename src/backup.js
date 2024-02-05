const fs = require('fs');
const path = require('path');

const sourceFolder = 'rendered';
const destinationFolder = '../backup';

// Função para obter uma string de data e hora formatada
function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `backup_${year}-${month}-${day}_${hours}-${minutes}`;
}

// Cria o caminho completo para o diretório de backup
const backupFolder = path.join(destinationFolder, getFormattedDateTime());

// Cria o diretório de backup
fs.mkdirSync(backupFolder);

// Função para copiar recursivamente os arquivos de uma pasta para outra
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Inicia o processo de cópia
copyFolderRecursiveSync(sourceFolder, backupFolder);

console.log(`Backup realizado com sucesso em: ${backupFolder}`);
