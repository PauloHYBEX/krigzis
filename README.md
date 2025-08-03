# 🚀 Krigzis - Gerenciador de Tarefas Avançado

<div align="center">

![Krigzis Logo](assets/icon_256x256.svg)

**Sistema completo de produtividade com timer Pomodoro, notas vinculadas, relatórios e IA integrada**

[![Versão](https://img.shields.io/github/v/release/PauloHYBEX/krigzis?color=00D4AA&style=for-the-badge)](https://github.com/PauloHYBEX/krigzis/releases)
[![Downloads](https://img.shields.io/github/downloads/PauloHYBEX/krigzis/total?color=7B3FF2&style=for-the-badge)](https://github.com/PauloHYBEX/krigzis/releases)
[![Licença](https://img.shields.io/github/license/PauloHYBEX/krigzis?color=00D4AA&style=for-the-badge)](LICENSE)

</div>

## ✨ Características Principais

- 📋 **Gerenciamento Avançado de Tarefas** - Sistema de categorias, prioridades e status
- ⏱️ **Timer Pomodoro Integrado** - Técnica de produtividade com controles personalizáveis
- 📝 **Notas Vinculadas** - Sistema de notas conectadas às tarefas
- 📊 **Relatórios e Estatísticas** - Acompanhe seu progresso e produtividade
- 🤖 **Assistente IA Configurável** - Integração com assistentes de IA (opcional)
- 🎨 **Interface Dark Mode** - Design moderno e profissional
- 🔄 **Sistema de Atualizações** - Verificação automática via GitHub Releases
- 💾 **Backup e Sincronização** - Dados seguros e acessíveis
- 🚀 **Versão Portável** - Não requer instalação ou privilégios administrativos

## 🖥️ Interface

O Krigzis oferece uma interface intuitiva e moderna, com:
- Dashboard centralizado para visão geral
- Sistema de abas para organização
- Modais para criação/edição de tarefas e notas
- Configurações avançadas e personalizáveis
- Relatórios visuais com gráficos

## 📥 Download e Instalação

### Windows (Recomendado)

1. **Baixe a versão mais recente**: [Krigzis v1.0.0](https://github.com/PauloHYBEX/krigzis/releases/latest)
2. **Extraia o arquivo ZIP** em qualquer pasta
3. **Execute `start.bat`** - o script instalará automaticamente as dependências
4. **Aguarde a inicialização** - a aplicação abrirá automaticamente

### Requisitos do Sistema

- **Windows 10 ou superior**
- **4GB RAM** (mínimo)
- **100MB espaço em disco**
- **Node.js 16+** (instalado automaticamente se necessário)

## 🚀 Funcionalidades Detalhadas

### 📋 Sistema de Tarefas
- Criação e edição de tarefas com títulos e descrições
- Sistema de categorias personalizáveis
- Definição de prioridades (baixa, média, alta, crítica)
- Status de acompanhamento (pendente, em progresso, concluído)
- Data de vencimento e lembretes
- Vinculação com notas relacionadas

### ⏱️ Timer Pomodoro
- Sessões de trabalho cronometradas
- Pausas curtas e longas configuráveis
- Histórico de sessões
- Integração com tarefas ativas
- Notificações sonoras e visuais

### 📝 Sistema de Notas
- Criação de notas ricas em texto
- Sistema de tags para organização
- Vinculação direta com tarefas
- Cores personalizáveis para categorização
- Busca e filtros avançados

### 📊 Relatórios
- Estatísticas de produtividade
- Gráficos de progresso
- Análise de tempo gasto por categoria
- Relatórios de metas atingidas
- Exportação de dados

### 🤖 Assistente IA
- Integração opcional com serviços de IA
- Sugestões inteligentes para organização
- Análise de padrões de produtividade
- Configuração flexível de APIs

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Git

### Instalação para Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/PauloHYBEX/krigzis.git
cd krigzis

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Criar distribuição
npm run package:win
```

### Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila para produção
- `npm run build:main` - Compila apenas o processo principal
- `npm run build:preload` - Compila apenas o preload
- `npm run build:renderer` - Compila apenas o renderer
- `npm run package:win` - Cria pacote para Windows
- `npm run package:mac` - Cria pacote para macOS
- `npm run package:linux` - Cria pacote para Linux

### Arquitetura

```
krigzis/
├── src/
│   ├── main/           # Processo principal do Electron
│   ├── renderer/       # Interface React
│   └── shared/         # Código compartilhado
├── assets/             # Ícones e recursos
├── scripts/            # Scripts de build e distribuição
└── webpack/            # Configurações do Webpack
```

## 🔄 Sistema de Atualizações

O Krigzis verifica automaticamente por atualizações através do GitHub Releases:
- Verificação automática na inicialização
- Notificação discreta quando há atualizações
- Download manual da nova versão
- Processo de atualização simples

## 🐛 Suporte e Bugs

Se você encontrar algum problema ou tiver sugestões:

1. **Verifique** se já existe uma [issue](https://github.com/PauloHYBEX/krigzis/issues) similar
2. **Crie uma nova issue** com detalhes do problema
3. **Inclua** informações do sistema e passos para reproduzir

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Comunidade Electron pela plataforma
- Equipe React pelo framework
- Desenvolvedores de todas as bibliotecas utilizadas
- Beta testers e usuários que forneceram feedback

---

<div align="center">

**Feito com ❤️ por [Paulo Ricardo](https://github.com/PauloHYBEX)**

[Website](https://github.com/PauloHYBEX/krigzis) • [Releases](https://github.com/PauloHYBEX/krigzis/releases) • [Issues](https://github.com/PauloHYBEX/krigzis/issues)

</div>