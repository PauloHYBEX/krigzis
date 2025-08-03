# 🚀 Guia de Deploy e Versionamento - Krigzis

## 📋 **Processo Completo de Lançamento de Versões**

### **1. 📂 Preparação da Versão**

#### **Passo 1: Atualizar Versão**
```bash
# Editar package.json
{
  "version": "1.1.0"  // Incrementar conforme SemVer
}
```

#### **Passo 2: Testar Aplicação**
```bash
npm run build        # Build de produção
npm start           # Testar aplicação
```

#### **Passo 3: Commit e Tag**
```bash
git add .
git commit -m "🎉 Release v1.1.0 - [Descrição das mudanças]"
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main
git push origin v1.1.0
```

### **2. 📦 Build e Distribuição**

#### **Automatizado via GitHub Actions** (Recomendado)
Crie `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Package application
      run: npm run dist
      
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: krigzis-${{ matrix.os }}
        path: dist/
```

#### **Manual** (Para desenvolvimento)
```bash
npm run build       # Build da aplicação
npm run package     # Criar executáveis (você precisa configurar electron-builder)
```

### **3. 🔄 Sistema de Atualizações**

#### **Como Funciona:**
1. **Usuário abre o Krigzis** → Sistema verifica atualizações automaticamente
2. **GitHub Releases** → API fornece informações da última versão
3. **Comparação SemVer** → Compara versão atual vs. disponível  
4. **Notificação** → Usuário é notificado sobre nova versão
5. **Download** → Usuário pode baixar e instalar

#### **Configuração do Servidor de Atualizações:**

**Opção A: GitHub Releases (Gratuito)**
```typescript
// src/main/version/version-manager.ts - linha 165
const updateServerUrl = 'https://api.github.com/repos/SEU-USUARIO/krigzis/releases/latest';
```

**Opção B: Servidor Próprio**
```typescript
const updateServerUrl = 'https://seu-servidor.com/api/v1/releases/latest';
```

### **4. 📝 Semantic Versioning (SemVer)**

#### **Formato: MAJOR.MINOR.PATCH**

- **MAJOR (1.0.0 → 2.0.0)**: Mudanças incompatíveis
- **MINOR (1.0.0 → 1.1.0)**: Novas funcionalidades compatíveis  
- **PATCH (1.0.0 → 1.0.1)**: Correções de bugs

#### **Exemplos:**
```bash
# Correção de bug
1.0.0 → 1.0.1

# Nova funcionalidade  
1.0.1 → 1.1.0

# Mudança incompatível
1.1.0 → 2.0.0

# Versões beta
1.1.0 → 1.2.0-beta.1
```

### **5. 🎯 Configuração Inicial**

#### **1. Configurar package.json para build:**
```json
{
  "build": {
    "appId": "com.krigzis.app", 
    "productName": "Krigzis",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

#### **2. Instalar electron-builder:**
```bash
npm install --save-dev electron-builder
```

#### **3. Adicionar scripts no package.json:**
```json
{
  "scripts": {
    "dist": "electron-builder",
    "dist:win": "electron-builder --win",
    "dist:mac": "electron-builder --mac", 
    "dist:linux": "electron-builder --linux"
  }
}
```

### **6. 🔧 Configurações de Produção**

#### **Variáveis de Ambiente:**
```bash
NODE_ENV=production    # Desabilita verificação de atualizações em dev
```

#### **Configurar URL do seu repositório:**
```typescript
// src/main/version/version-manager.ts
const updateServerUrl = 'https://api.github.com/repos/SEU-USUARIO/krigzis/releases/latest';
```

### **7. 📊 Monitoramento**

#### **Logs de Atualização:**
- Sistema registra automaticamente tentativas de atualização
- Logs disponíveis em **Configurações → Logs**
- Auditoria completa de versões instaladas

#### **Estatísticas:**
- Versão atual vs. disponível
- Última verificação de atualização
- Canal de atualização configurado

### **8. 🚨 Solução de Problemas**

#### **Usuário não recebe atualizações:**
1. Verificar conexão com internet
2. Verificar configurações em **Configurações → Atualizações**
3. Tentar verificação manual

#### **Download falha:**
1. Verificar URL do release no GitHub
2. Verificar permissões de download
3. Verificar logs em **Configurações → Logs**

#### **Desenvolvimento (dados mockados removidos):**
- Em modo desenvolvimento, verificações são desabilitadas
- Use `NODE_ENV=production` para testar atualizações

---

## **🎯 Resumo Rápido:**

1. **Desenvolver** → `npm run dev`
2. **Testar** → `npm run build && npm start`  
3. **Versionar** → Editar `package.json` + git tag
4. **Release** → GitHub Actions ou `npm run dist`
5. **Usuários** → Recebem notificação automática

**Sistema totalmente automatizado! 🚀**