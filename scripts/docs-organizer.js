/*
 Organiza a documentação:
 - Move arquivos .md da raiz para docs/
 - Move assets/README.md para docs/assets/README.md (se existir)
 - Gera docs/_UNIFICADO.md concatenando todo o conteúdo dos .md
 - Gera docs/README.md com índice (links relativos) e referência ao unificado
*/

const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function moveRootMarkdownFilesToDocs(rootDirectoryPath, docsDirectoryPath) {
  const directoryEntries = fs.readdirSync(rootDirectoryPath, { withFileTypes: true });
  for (const entry of directoryEntries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const sourcePath = path.join(rootDirectoryPath, entry.name);
      const destinationPath = path.join(docsDirectoryPath, entry.name);
      if (path.resolve(sourcePath) !== path.resolve(destinationPath)) {
        fs.renameSync(sourcePath, destinationPath);
      }
    }
  }
}

function moveAssetsReadmeToDocs(rootDirectoryPath, docsDirectoryPath) {
  const assetsReadmePath = path.join(rootDirectoryPath, 'assets', 'README.md');
  if (fs.existsSync(assetsReadmePath)) {
    const docsAssetsDirectoryPath = path.join(docsDirectoryPath, 'assets');
    ensureDirectoryExists(docsAssetsDirectoryPath);
    const destinationPath = path.join(docsAssetsDirectoryPath, 'README.md');
    fs.renameSync(assetsReadmePath, destinationPath);
  }
}

function collectAllMarkdownFilesRecursively(startDirectoryPath, markdownFilePaths) {
  const directoryEntries = fs.readdirSync(startDirectoryPath, { withFileTypes: true });
  for (const entry of directoryEntries) {
    const entryPath = path.join(startDirectoryPath, entry.name);
    if (entry.isDirectory()) {
      collectAllMarkdownFilesRecursively(entryPath, markdownFilePaths);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      if (path.basename(entryPath) === '_UNIFICADO.md') {
        continue;
      }
      markdownFilePaths.push(entryPath);
    }
  }
}

function generateUnifiedMarkdownFile(docsDirectoryPath, markdownFilePaths) {
  const outputFilePath = path.join(docsDirectoryPath, '_UNIFICADO.md');
  let unifiedContent = '';
  for (const filePath of markdownFilePaths) {
    const relativePath = path.relative(docsDirectoryPath, filePath).replace(/\\/g, '/');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    unifiedContent += `## ${relativePath}\n\n`;
    unifiedContent += fileContent;
    unifiedContent += `\n\n---\n\n`;
  }
  fs.writeFileSync(outputFilePath, unifiedContent, 'utf8');
  return outputFilePath;
}

function generateDocsIndexFile(docsDirectoryPath, markdownFilePaths) {
  const indexFilePath = path.join(docsDirectoryPath, 'README.md');
  let indexContent = '# Documentação consolidada\n\n';
  indexContent += 'Arquivos incluídos:\n\n';
  for (const filePath of markdownFilePaths) {
    const relativePath = path.relative(docsDirectoryPath, filePath).replace(/\\/g, '/');
    indexContent += `- [${relativePath}](${encodeURI(relativePath)})\n`;
  }
  indexContent += '\nArquivo unificado: [_UNIFICADO.md](_UNIFICADO.md)\n';
  fs.writeFileSync(indexFilePath, indexContent, 'utf8');
  return indexFilePath;
}

function run() {
  const rootDirectoryPath = process.cwd();
  const docsDirectoryPath = path.join(rootDirectoryPath, 'docs');

  ensureDirectoryExists(docsDirectoryPath);
  moveRootMarkdownFilesToDocs(rootDirectoryPath, docsDirectoryPath);
  moveAssetsReadmeToDocs(rootDirectoryPath, docsDirectoryPath);

  const markdownFilePaths = [];
  collectAllMarkdownFilesRecursively(docsDirectoryPath, markdownFilePaths);
  markdownFilePaths.sort((a, b) => a.localeCompare(b));

  const unifiedPath = generateUnifiedMarkdownFile(docsDirectoryPath, markdownFilePaths);
  const indexPath = generateDocsIndexFile(docsDirectoryPath, markdownFilePaths);

  console.log(`Consolidado ${markdownFilePaths.length} arquivos.`);
  console.log(`Unificado: ${unifiedPath}`);
  console.log(`Índice:    ${indexPath}`);
}

run();


