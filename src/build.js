const fs = require('fs').promises;
const path = require('path');

// Source directory for copying
const sourceDirectory = './src/rendered';

// Placeholder for the destination directory (replace 'YOUR_DESTINATION_PATH' with your actual path)
const destinationDirectory = 'YOUR_DESTINATION_PATH';

// Caminho final do diretório de destino em relação ao diretório atual
const finalDestinationDirectory = path.join(process.cwd(), destinationDirectory);

// Async function to copy a directory and its contents
async function copyDirectory(source, destination) {
  try {
    // Check if the destination directory exists, and create it if not
    if (!await fs.stat(destination).catch(() => false)) {
      await fs.mkdir(destination, { recursive: true });
    }

    // Read the contents of the source directory
    const files = await fs.readdir(source);

    // Loop through each file in the source directory
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destinationPath = path.join(destination, file);

      // Get file/directory information
      const stat = await fs.stat(sourcePath);

      // If it's a directory, recursively copy it
      if (stat.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath);
      } else {
        // If it's a file, copy it directly
        await fs.copyFile(sourcePath, destinationPath);
      }
    }

    // Log success message after copying the entire directory
    console.log(`Directory ${source} copied to ${destination}`);
  } catch (err) {
    // Log an error message if copying fails
    console.error(`Error copying directory: ${err.message}`);
  }
}

// Log a message indicating the start of the copying process
console.log('Copying directory...');

// Start the copying process by calling the copyDirectory function
copyDirectory(sourceDirectory, finalDestinationDirectory);
