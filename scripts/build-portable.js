/**
 * Script para criar build portável sem installer
 * Contorna problemas de permissões de administrador
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Criando build portável do Krigzis...');

try {
    // 1. Build da aplicação
    console.log('📦 Fazendo build da aplicação...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 2. Package apenas o diretório (sem installer)
    console.log('🔧 Empacotando aplicação...');
    execSync('npx electron-builder --win --dir', { stdio: 'inherit' });
    
    // 3. Criar arquivo README para distribuição
    const readmeContent = `# Krigzis - Versão Portável

## Como usar:
1. Extraia todos os arquivos para uma pasta
2. Execute Krigzis.exe
3. A aplicação funcionará sem instalação

## Características desta versão:
- ✅ Funciona sem instalação
- ✅ Não requer privilégios de administrador
- ✅ Banco de dados local (memory-based)
- ✅ Sistema de atualizações integrado
- ✅ Todas as funcionalidades disponíveis

## Sistema de Atualizações:
- A aplicação verifica atualizações automaticamente
- Você será notificado quando houver novas versões
- Faça download manual do GitHub Releases

Versão: ${require('../package.json').version}
Data: ${new Date().toLocaleDateString('pt-BR')}
`;

    const releaseDir = path.join(__dirname, '..', 'release', 'win-unpacked');
    if (fs.existsSync(releaseDir)) {
        fs.writeFileSync(path.join(releaseDir, 'README.txt'), readmeContent);
        console.log('✅ Build portável criado com sucesso!');
        console.log(`📁 Local: ${releaseDir}`);
        console.log('📋 Próximos passos:');
        console.log('   1. Comprimir a pasta win-unpacked como ZIP');
        console.log('   2. Fazer upload para GitHub Releases');
        console.log('   3. Usuarios podem baixar e executar sem instalar');
    } else {
        console.error('❌ Diretório de release não encontrado');
    }
    
} catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
}