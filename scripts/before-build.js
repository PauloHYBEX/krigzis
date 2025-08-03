/**
 * Script executado antes do build do Electron
 * Prepara dependências problemáticas
 */

const fs = require('fs');
const path = require('path');

async function beforeBuild(context) {
    console.log('🔧 Executando before-build script...');
    
    try {
        // Log da plataforma alvo
        console.log(`📦 Building for: ${context.platform.name} ${context.arch}`);
        
        // Verificar se SQLite3 está presente e funcional
        const sqlite3Path = path.join(__dirname, '..', 'node_modules', 'sqlite3');
        if (fs.existsSync(sqlite3Path)) {
            console.log('✅ SQLite3 encontrado');
            
            // Tentar carregar o módulo para verificar se funciona
            try {
                require('sqlite3');
                console.log('✅ SQLite3 carregado com sucesso');
            } catch (error) {
                console.warn('⚠️ SQLite3 com problemas, usando fallback para memory database');
                // O aplicativo já tem fallback para memory database
            }
        } else {
            console.log('ℹ️ SQLite3 não encontrado, usando memory database');
        }
        
        console.log('✅ Before-build script concluído');
        
    } catch (error) {
        console.error('❌ Erro no before-build script:', error);
        // Não falhar o build, apenas avisar
    }
}

module.exports = beforeBuild;