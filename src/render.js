const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const beautify = require('js-beautify').html;
const yaml = require('js-yaml');

// Custom Showdown extension to remove specific attributes
const customShowdownExtension = () => {
  const removeMarkdownAttribute = (text) => {
    return text.replace(/(<[^>]+)\s*markdown="1"([^>]*>)/g, '$1$2');
  };

  const removeHeaderIdAttribute = (text) => {
    return text.replace(/(<h[1-6])\s*id=".*?"/g, '$1');
  };

  return [
    {
      type: 'output',
      filter: (text) => {
        return removeHeaderIdAttribute(removeMarkdownAttribute(text));
      },
    },
  ];
};

// Paths for input (Markdown) and output (HTML) directories

const toRenderFolderPath = './src/to-render';
const outputFolderPath = './src/rendered';

// Function to process individual Markdown file
function processFile(filePath, relativePath) {
  const fileName = path.basename(filePath);

  // Check if the file has a .md extension
  if (path.extname(fileName).toLowerCase() === '.md') {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Extract YAML front matter if present
    const match = fileContent.match(/---([\s\S]*?)---/);
    let frontMatter = {};
    let markdownContent = fileContent;

    if (match) {
      try {
        frontMatter = yaml.load(match[1]);
        markdownContent = fileContent.slice(match[0].length);
      } catch (error) {
        // Handle YAML parsing errors
        console.error(`Error parsing YAML front matter in ${fileName}:`, error);
        console.log('YAML front matter content:', match[1]);
        return;
      }
    }

    // Paths for additional HTML files (header, footer, metadata)
    const headerFilePath = path.join(toRenderFolderPath, 'header.html');
    const headerContent = fs.existsSync(headerFilePath) ? fs.readFileSync(headerFilePath, 'utf-8') : '';

    const footerFilePath = path.join(toRenderFolderPath, 'footer.html');
    const footerContent = fs.existsSync(footerFilePath) ? fs.readFileSync(footerFilePath, 'utf-8') : '';

    const metaFilePath = path.join(toRenderFolderPath, 'metadata.html');
    const metaContent = fs.existsSync(metaFilePath) ? fs.readFileSync(metaFilePath, 'utf-8') : '';

    // Convert Markdown to HTML using Showdown
    const htmlContent = converter.makeHtml(markdownContent);

    // Paths for output HTML file
    const outputSubfolderPath = path.join(outputFolderPath, relativePath);
    const outputFilePath = path.join(outputSubfolderPath, `${path.basename(fileName, '.md')}.html`);

    // Construct the final HTML content
    const finalHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${frontMatter.title || 'Placeholder Title'}</title>
        ${metaContent}
    </head>
    <body>
        <main>
            ${headerContent}
            ${htmlContent}
        </main>
        ${footerContent}
    </body>
    </html>
    `;

    // Beautify the HTML content
    const formattedHtml = beautify(finalHtml, { indent_size: 4 });

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputSubfolderPath)) {
      fs.mkdirSync(outputSubfolderPath, { recursive: true });
    }

    // Write the formatted HTML to the output file
    fs.writeFileSync(outputFilePath, formattedHtml);

    // Log completion message
    console.log(`Conversion completed for ${fileName}. The HTML file has been saved to '${outputFilePath}'.`);
  }
}

// Function to process all files in a directory recursively
function processFolder(folderPath, relativePath = '') {
  const items = fs.readdirSync(folderPath);

  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    const itemRelativePath = path.join(relativePath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      // Recursively process subdirectories
      processFolder(itemPath, itemRelativePath);
    } else {
      // Process individual files
      processFile(itemPath, relativePath);
    }
  });
}

// Create a Showdown converter with custom extensions
const converter = new showdown.Converter({ extensions: [customShowdownExtension] });

// Start the conversion process for the specified directory
processFolder(toRenderFolderPath);

// Log completion message
console.log('All files have been processed. Please update the directory paths accordingly.');
