# 📦 Guia de Distribuição - Krigzis

## 🚀 Processo de Release

### 1. Preparação
```bash
# 1. Certificar que o build funciona
npm run build

# 2. Testar a aplicação
npm start

# 3. Atualizar versão no package.json
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0  
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Configuração Necessária

#### **A. Repository GitHub**
1. Criar repositório no GitHub
2. Atualizar URLs em:
   - `package.json` → `build.publish.owner`
   - `src/main/version/version-manager.ts` → `updateServerUrl`

#### **B. Ícones da Aplicação**
```bash
# Criar ícones necessários em assets/
assets/
├── icon.ico     # Windows (256x256)
├── icon.icns    # macOS 
├── icon.png     # Linux (512x512)
└── icon@2x.png  # High DPI
```

#### **C. Secrets do GitHub**
- `GITHUB_TOKEN` (automático)
- `CSC_LINK` (certificado macOS/Windows - opcional)
- `CSC_KEY_PASSWORD` (senha do certificado - opcional)

### 3. Publicação

#### **Automática (Recomendado)**
```bash
# 1. Criar tag
git tag v1.0.0

# 2. Push com tags
git push origin v1.0.0

# GitHub Actions irá automaticamente:
# - Fazer build para Windows, macOS, Linux
# - Criar release no GitHub
# - Anexar executáveis ao release
```

#### **Manual**
```bash
# Build local e publicação
npm run build
npm run package:win    # Windows
npm run package:mac    # macOS  
npm run package:linux  # Linux
npm run package:all    # Todos
```

### 4. Distribuição aos Usuários

#### **A. Sistema de Atualizações Automáticas**
- ✅ Verificação automática implementada
- ✅ Busca releases do GitHub
- ✅ Notificação ao usuário
- ⚠️ Download/instalação manual (por enquanto)

#### **B. Canais de Distribuição**
- **GitHub Releases** - Principal
- **Website** - Download direto dos releases
- **Microsoft Store** - Futuro
- **Mac App Store** - Futuro

### 5. Versionamento

#### **Formato: `X.Y.Z`**
- **X (Major)**: Mudanças incompatíveis
- **Y (Minor)**: Novas funcionalidades
- **Z (Patch)**: Correções de bugs

#### **Estratégia de Branches**
```
main          → Versão estável (releases)
develop       → Desenvolvimento ativo
feature/*     → Novas funcionalidades
hotfix/*      → Correções urgentes
```

## 📊 Status Atual

### ✅ Implementado
- [x] Electron Builder configurado
- [x] Scripts de build funcionais
- [x] Version Manager conectado ao GitHub
- [x] GitHub Actions workflow
- [x] Sistema de verificação de atualizações

### ⚠️ Pendente
- [ ] Ícones da aplicação
- [ ] Repositório GitHub real
- [ ] Certificados de assinatura (code signing)
- [ ] Testes de distribuição

### 🔧 Configuração Imediata Necessária

1. **Criar ícones** → `assets/icon.*`
2. **Repository GitHub** → Atualizar URLs
3. **Testar build** → `npm run package:win`

## 🎯 Próximos Passos

1. Criar ícones da aplicação
2. Configurar repositório GitHub
3. Fazer primeiro release de teste
4. Implementar code signing
5. Automatizar distribuição completa