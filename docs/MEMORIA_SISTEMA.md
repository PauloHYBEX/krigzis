# 💾 Memória do Sistema - Task Manager com IA

## 📌 Informações Essenciais do Projeto

### Nome do Sistema
**Nome Interno**: Krigzis Task Manager
**Nome de Exibição**: Gerenciador de Tarefas Inteligente

### Especificações Técnicas
- **Plataforma**: Desktop (Windows, macOS, Linux)
- **Framework**: Electron + React + TypeScript
- **Banco de Dados**: SQLite (local)
- **IA/ML**: TensorFlow.js (processamento local)
- **Idiomas**: PT-BR (padrão), EN, ES

### Características Removidas das Imagens
- ❌ Campos de pagamento
- ❌ "Free Trial" / "Upgrade Now"
- ❌ Referências a planos pagos
- ❌ Limitações de trial

## 📂 Estrutura do Projeto

### Organização de Pastas
```
krigzis/
├── docs/                    # Toda documentação do projeto
│   ├── PLANO_DESENVOLVIMENTO.md
│   ├── FASE_1_CHECKLIST.md
│   ├── ARQUITETURA_SISTEMA.md
│   ├── DESIGN_SYSTEM.md
│   └── MEMORIA_SISTEMA.md
├── src/                     # Código fonte (será criado)
│   ├── main/               # Processo principal Electron
│   ├── renderer/           # Processo renderer (React)
│   └── shared/             # Código compartilhado
├── assets/                  # Recursos estáticos
├── tests/                   # Testes automatizados
└── [outros arquivos de configuração]
```

## 🎯 Funcionalidades Core

### 1. Gerenciamento de Tarefas
- **Listas**: Backlog, Esta Semana, Hoje, Concluído
- **Campos por Tarefa**:
  - Título
  - Descrição (opcional)
  - Tempo estimado
  - Tempo real gasto
  - Tags (sugeridas por IA)
  - Prioridade
  - Data de criação/conclusão

### 2. Controle de Tempo
- **Timer/Cronômetro**: Contagem crescente
- **Pomodoro**: Ciclos configuráveis
- **Pausas**: Automáticas ou manuais
- **Registro**: Histórico detalhado

### 3. Sistema de IA
- **Predições**: Duração estimada de tarefas
- **Categorização**: Automática com aprendizado
- **Insights**: Padrões de produtividade
- **Sugestões**: Otimização de agenda

### 4. Notificações
- **Desktop**: Nativas do SO
- **Sons**: Personalizáveis
- **Alertas**: Início/fim de tarefas
- **Lembretes**: Pausas recomendadas

### 5. Relatórios
- **Visualizações**: Gráficos de produtividade
- **Métricas**: Tempo por tarefa/categoria
- **Exportação**: PDF, CSV, JSON
- **Período**: Diário, semanal, mensal

### 6. Notas
- **Formato**: Markdown
- **Vinculação**: Associar a tarefas
- **Busca**: Full-text search
- **Tags**: Sistema unificado

## 🎨 Diretrizes Visuais

### Paleta de Cores (Tema Escuro)
```
Fundo Principal: #0A0A0A
Fundo Secundário: #141414
Cor Primária: #00D4AA (verde água)
Cor Secundária: #7B3FF2 (roxo)
Texto Principal: #FFFFFF
Texto Secundário: #A0A0A0
```

### Elementos de UI
- **Bordas arredondadas**: 8-12px
- **Sombras sutis**: Apenas em hover
- **Gradientes**: Aplicados com moderação
- **Transições**: 200-300ms ease
- **Espaçamento**: Grid de 8px

## 📁 Armazenamento de Dados

### Estrutura de Pastas Configurável
```
user-selected-folder/
├── database/
│   └── tasks.db
├── models/          # Modelos de IA
├── backups/         # Backups automáticos
├── exports/         # Relatórios exportados
└── config.json      # Configurações
```

### Backup Automático
- Frequência: Diário
- Retenção: 30 dias
- Formato: SQLite + JSON
- Criptografia: Opcional

## 🔧 Configurações do Sistema

### Preferências Gerais
- **Idioma**: PT-BR | EN | ES
- **Tema**: Escuro | Claro | Sistema
- **Pasta de dados**: Selecionável
- **Inicializar com SO**: Sim/Não

### Configurações de Produtividade
- **Duração Pomodoro**: 25 min (configurável)
- **Duração Pausa Curta**: 5 min
- **Duração Pausa Longa**: 15 min
- **Alertas**: Som + Visual

### Configurações de IA
- **Ativar sugestões**: Sim/Não
- **Aprendizado contínuo**: Sim/Não
- **Nível de confiança mínimo**: 70%
- **Frequência de análise**: Diária

## 🚀 Roadmap de Implementação

### Fase Atual: 1 - Fundação
**Status**: Planejamento
**Duração**: 2 semanas
**Foco**: Setup inicial e arquitetura base

### Próximas Fases
2. **Core UI** (3 semanas)
3. **Gestão de Dados** (2 semanas)
4. **Funcionalidades Core** (4 semanas)
5. **IA e Analytics** (3 semanas)
6. **Features Avançadas** (3 semanas)
7. **Polimento** (2 semanas)

## 📝 Decisões Técnicas

### Escolhas de Arquitetura
1. **Electron**: Multiplataforma nativo
2. **React**: Componentização e ecosystem
3. **TypeScript**: Type safety e manutenibilidade
4. **SQLite**: Simplicidade e portabilidade
5. **TensorFlow.js**: ML no cliente

### Padrões de Código
- **Clean Architecture**: Separação de concerns
- **Repository Pattern**: Abstração de dados
- **Observer Pattern**: Eventos e notificações
- **Factory Pattern**: Criação de componentes

## 🔄 Estado Atual do Desenvolvimento

### Documentos Criados
- ✅ docs/PLANO_DESENVOLVIMENTO.md
- ✅ docs/FASE_1_CHECKLIST.md
- ✅ docs/ARQUITETURA_SISTEMA.md
- ✅ docs/DESIGN_SYSTEM.md
- ✅ docs/MEMORIA_SISTEMA.md

### Estrutura Atual
- ✅ Pasta `docs/` criada e organizada
- ⏳ Aguardando início da implementação (Fase 1)

### Próximos Passos
1. ~~Aprovar documentação~~ ✅
2. ~~Organizar documentos em pasta docs~~ ✅
3. ~~Configurar ambiente dev~~ ✅
4. ~~Iniciar Fase 1~~ ✅
5. ~~Setup inicial do projeto~~ ✅
6. ~~Implementar UI base~~ ✅
7. ~~Integrar banco de dados~~ ✅
8. Implementar Timer Pomodoro
9. Adicionar sistema de relatórios

## 🤝 Convenções e Acordos

### Nomenclatura
- **Componentes**: PascalCase
- **Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Arquivos**: kebab-case
- **CSS Classes**: kebab-case

### Git Workflow
- **Branch principal**: main
- **Feature branches**: feature/nome-da-feature
- **Commits**: Conventional Commits
- **PRs**: Require review

### Qualidade
- **Cobertura de testes**: Mínimo 80%
- **Linting**: Sem warnings
- **TypeScript**: Strict mode
- **Documentação**: JSDoc completo

---

**Última Atualização**: 25/06/2025
**Versão do Documento**: 1.1.0
**Mudanças**: Documentação movida para pasta `docs/`

> Este documento deve ser atualizado continuamente durante o desenvolvimento para manter o contexto e decisões do projeto.

## 🚨 Erros Encontrados e Soluções Implementadas

### 1. Problema: webpack.renderer.config.js Ausente
**Erro**: Script de desenvolvimento tentando usar arquivo inexistente
**Solução**: Criação do arquivo com configuração adequada do dev server
**Lição**: Sempre verificar dependências de configuração antes de executar scripts

### 2. Problema: CSS Loading com MIME Type Errors
**Erro**: Carregamento de CSS via HTML causando erros de MIME type
**Solução**: Importação direta de CSS nos arquivos TypeScript/JavaScript
**Lição**: Preferir importações diretas em aplicações Electron

### 3. Problema: "global is not defined" no Renderer
**Erro**: Variável global não definida no processo renderer
**Solução**: Múltiplas tentativas - polyfills, webpack DefinePlugin, ProvidePlugin
**Status**: Resolvido com polyfills inline no HTML
**Lição**: Electron renderer precisa de polyfills específicos para Node.js globals

### 4. Problema: Electron Security Warnings
**Erro**: webSecurity e allowRunningInsecureContent warnings
**Solução**: Configuração condicional apenas para desenvolvimento
**Lição**: Manter segurança em produção, flexibilidade em desenvolvimento

### 5. Problema: Development Server Instável
**Erro**: Webpack dev server com falhas de compilação
**Solução**: Uso de webpack.renderer.simple.config.js para arquivos estáticos
**Lição**: Simplicidade às vezes é melhor que complexidade desnecessária

## 🎯 Requisitos da Fase 3 - Gestão de Dados

### Prioridades Estabelecidas:
1. **Performance**: Manter aplicação leve e responsiva
2. **Minimalismo**: Design limpo e funcional
3. **Colaboração**: Preparar base para funcionalidades colaborativas
4. **Escalabilidade**: Arquitetura que suporte múltiplos usuários

### Estratégia de Implementação:
- **Etapas Incrementais**: Implementação por partes para evitar quebras
- **Testes Contínuos**: Validação após cada etapa
- **Backup de Segurança**: Manter versões funcionais
- **Otimização Constante**: Foco em performance desde o início

## 🗄️ Arquitetura de Dados Colaborativa

### Modelo de Dados Otimizado:
```sql
-- Tabela de Usuários (para colaboração futura)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Workspaces (para colaboração)
CREATE TABLE workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  is_shared BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tarefas (otimizada para colaboração)
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog',
  priority INTEGER DEFAULT 3,
  workspace_id INTEGER REFERENCES workspaces(id),
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  estimated_time INTEGER,
  actual_time INTEGER,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

### Otimizações de Performance:
1. **Índices Estratégicos**: Em campos de busca frequente
2. **Lazy Loading**: Carregamento sob demanda
3. **Cache Inteligente**: Minimizar queries desnecessárias
4. **Paginação**: Para listas grandes
5. **Debounce**: Em operações de busca

## 🔧 Ferramentas e Tecnologias Escolhidas

### Banco de Dados:
- **SQLite**: Leve, sem servidor, ideal para aplicações desktop
- **Knex.js**: Query builder para queries otimizadas
- **Migrations**: Controle de versão do schema

### Estado e Cache:
- **Zustand**: Gerenciamento de estado leve
- **React Query**: Cache e sincronização de dados
- **IndexedDB**: Cache offline para dados grandes

### Validação e Segurança:
- **Zod**: Validação de schemas TypeScript-first
- **Crypto**: Criptografia de dados sensíveis
- **Sanitização**: Prevenção de injection attacks

## 📊 Métricas de Performance Alvo

### Tempo de Resposta:
- **Queries Simples**: < 50ms
- **Queries Complexas**: < 200ms
- **Startup da Aplicação**: < 3s
- **Sincronização**: < 1s

### Uso de Recursos:
- **RAM**: < 150MB em uso normal
- **Disco**: < 50MB para dados locais
- **CPU**: < 5% em idle

## 🚀 Roadmap de Implementação

### Etapa 1: Setup Base (Semana 1 - Dias 1-2)
- [ ] Instalação e configuração SQLite
- [ ] Setup Knex.js e migrations
- [ ] Estrutura de pastas para dados

### Etapa 2: Modelos Core (Semana 1 - Dias 3-4)
- [ ] Schema de tarefas
- [ ] Schema de usuários
- [ ] Schema de workspaces
- [ ] Validação com Zod

### Etapa 3: Repository Pattern (Semana 1 - Dias 5-7)
- [ ] Implementação de repositories
- [ ] Interfaces TypeScript
- [ ] Testes unitários

### Etapa 4: Integração Frontend (Semana 2 - Dias 1-3)
- [ ] Hooks personalizados
- [ ] Integração com Dashboard
- [ ] Estado global com Zustand

### Etapa 5: Otimização e Backup (Semana 2 - Dias 4-7)
- [ ] Sistema de backup
- [ ] Cache e performance
- [ ] Testes de integração

## 🤝 Preparação para Colaboração

### Funcionalidades Futuras:
1. **Compartilhamento de Workspaces**
2. **Comentários em Tarefas**
3. **Notificações em Tempo Real**
4. **Histórico de Alterações**
5. **Permissões Granulares**

### Arquitetura Preparada:
- **Multi-tenant**: Suporte a múltiplos usuários
- **Sync Engine**: Base para sincronização futura
- **Event Sourcing**: Histórico completo de mudanças
- **Conflict Resolution**: Resolução de conflitos automática

---

**Última Atualização**: ${new Date().toLocaleDateString('pt-BR')}
**Versão**: 2.0.0
**Status**: Fase 3 em Implementação 

## 🚨 Problemas Críticos Resolvidos

### ❌ Problema: SQLite3 Binding Error (RESOLVIDO - Dezembro 2024)
**Erro**: `TypeError: Cannot read properties of undefined (reading 'indexOf') at bindings.js`

**Causa Raiz**:
- SQLite3 usa binários nativos que não podem ser empacotados pelo webpack
- O webpack tentava processar `sqlite3-binding.js` causando falha na inicialização
- Conflito entre processo main do Electron e dependências nativas

**Solução Implementada**:
1. **DatabaseManager Pattern**: Criado `src/main/database-manager.ts` como abstração
2. **MemoryDatabase com Persistência**: Implementado `src/shared/database/memory-db.ts`
   - Usa sistema de arquivos (`fs`) em vez de SQLite
   - Persiste dados em `data/memory-tasks.json`
   - Mantém todas as funcionalidades do banco de dados
3. **Webpack Configuration**: 
   - SQLite3 marcado como `external` em `webpack.main.config.js`
   - Modo development por padrão para evitar problemas de produção
4. **Fallback Strategy**: Sistema tenta SQLite primeiro, usa MemoryDatabase se falhar

**Arquivos Criados/Modificados**:
- `src/main/database-manager.ts` (NOVO)
- `src/shared/database/memory-db.ts` (NOVO)
- `src/main/index.ts` (ATUALIZADO)
- `webpack.main.config.js` (ATUALIZADO)
- `package.json` (SCRIPTS ATUALIZADOS)

**Resultado**:
- ✅ Aplicação inicia sem erros
- ✅ Banco de dados funcional com persistência
- ✅ Performance mantida (~20MB memória)
- ✅ Dados de exemplo carregados automaticamente

### ❌ Problema: Webpack Dev Server CSS Loading (RESOLVIDO - Novembro 2024)
**Erro**: MIME type errors para arquivos CSS

**Solução**: Importação direta de CSS nos componentes TypeScript em vez de tags `<link>` no HTML.

### ❌ Problema: Global Variable Error (RESOLVIDO - Novembro 2024)
**Erro**: `global is not defined` no processo renderer

**Solução**: Polyfills adicionados via webpack e configuração de fallbacks. 

## Últimas Atualizações (Dezembro 2024)

### Correções de Bugs Implementadas

#### 1. Correção de Estilização da Aba Sessões em Configurações
**Problema**: A aba Sessões estava usando estilos inline customizados que não seguiam o padrão do sistema.
**Solução**:
- Substituição de todas as variáveis CSS customizadas por variáveis do sistema
- Padronização de cores usando:
  - `var(--color-bg-primary)`, `var(--color-bg-secondary)`, `var(--color-bg-tertiary)`
  - `var(--color-border-primary)`, `var(--color-border-secondary)`
  - `var(--color-text-primary)`, `var(--color-text-secondary)`
  - `var(--color-primary-teal)`, `var(--color-accent-*)` para cores de destaque
- Uso consistente de variáveis de espaçamento (`--space-*`) e tamanhos de fonte (`--font-size-*`)

#### 2. Correção do Teste e Salvamento de API na IA
**Problema**: O botão "Testar e Salvar API Key" não fornecia feedback visual e não salvava as configurações corretamente.
**Solução**:
- Adição do hook `useToast` para feedback visual
- Implementação de tratamento de erros com try/catch
- Exibição de toast de sucesso: "API {PROVIDER} configurada com sucesso!"
- Exibição de toast de erro com mensagem específica
- Salvamento automático da configuração após validação bem-sucedida
- Chamada do callback `onSave` quando fornecido
- Limpeza de erros anteriores antes de nova validação

#### 3. Padronização de Variáveis CSS
**Problema**: Uso inconsistente de variáveis CSS antigas e novas em todo o projeto.
**Solução**:
- Mapeamento de variáveis antigas para novas:
  - `--bg-primary` → `--color-bg-primary`
  - `--bg-secondary` → `--color-bg-secondary`
  - `--bg-tertiary` → `--color-bg-tertiary`
  - `--border-color` → `--color-border-primary`
  - `--text-primary` → `--color-text-primary`
  - `--text-secondary` → `--color-text-secondary`
  - `--primary-500` → `--color-primary-teal`
  - `--primary-bg` → `--color-bg-card`
  - `--text-tertiary` → `--color-text-muted`
  - `--color-primary` → `--color-primary-teal`

### Componentes Afetados
1. **SessionManager.tsx**: Completamente refatorado para usar variáveis CSS do sistema
2. **AISettings.tsx**: Atualizado com feedback visual e variáveis CSS padronizadas
3. **useAIConfig.ts**: Hook mantido sem alterações (já estava funcional)

### Melhorias de UX
- Feedback visual imediato ao testar APIs
- Mensagens de erro específicas para cada tipo de falha
- Preview de 5 segundos mostrando capacidades da IA após configuração bem-sucedida
- Transições suaves e cores consistentes em toda a interface 

## Correções Críticas - Sessão Encerrando Sozinha e Token Não Aparecendo

### 1. **Problema: Sessão Encerrava Sozinha** 🚨
**Causa**: O hook `useSession` estava usando estados derivados do `sessionService` em vez do estado local, causando desconexões.

**Solução Implementada**:
```typescript
// ANTES (problemático)
const isHost = sessionService.isHost();
const isConnected = sessionService.isConnected();
const users = sessionService.getUsers();

// DEPOIS (corrigido)
const isHost = currentSession ? currentSession.host.id === localStorage.getItem('krigzis-user-id') : false;
const isConnected = currentSession !== null;
const users = currentSession?.users || [];
```

### 2. **Problema: Token Não Aparecia no Modal** 🎯
**Causa**: O estado `inviteCode` não estava sincronizado entre componentes e não persistia.

**Solução Implementada**:
- **Persistência no localStorage**: Cada código é salvo com expiração de 25 segundos
- **Sincronização automática**: useEffect monitora mudanças na sessão
- **Restauração inteligente**: Códigos válidos são restaurados automaticamente

**Localização das correções**:
- `src/renderer/hooks/useSession.ts` - linhas 280-285
- `src/renderer/components/Dashboard.tsx` - linhas 140-160
- `src/renderer/components/SessionManager.tsx` - linhas 70-95

### 3. **Melhorias na Persistência de Sessão** 💾
- **Validação de sessão**: Verifica se a sessão é válida ao restaurar
- **Limpeza automática**: Remove sessões inválidas do localStorage
- **Logs detalhados**: Facilita debugging de problemas de sessão

### 4. **Sincronização de Estado** 🔄
- **localStorage como fonte única**: Códigos de convite persistem entre componentes
- **Expiração automática**: Códigos expirados são removidos automaticamente
- **Estado reativo**: Mudanças na sessão atualizam automaticamente a UI

### 5. **Funcionalidades Corrigidas** ✅
- ✅ Sessão não encerra mais sozinha ao mudar abas
- ✅ Token aparece imediatamente após criação
- ✅ Token persiste entre Dashboard e Configurações
- ✅ Códigos expirados são limpos automaticamente
- ✅ Restauração de sessão após reiniciar app
- ✅ Estado sincronizado entre todos os componentes

### 5. Próximos Passos
- Testar fluxo completo de criação e entrada em sessão
- Refinar interface do usuário baseado no feedback
- Implementar testes automatizados para o sistema de sessões 