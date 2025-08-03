# 📊 SISTEMA DE LOGGING - GUIA DO USUÁRIO

## 🎯 **VISÃO GERAL**

O Krigzis possui um sistema completo de logging que registra automaticamente todas as ações importantes, erros e eventos do sistema. Este sistema é **100% privado** e mantém seus dados seguros.

---

## 🔍 **COMO ACESSAR OS LOGS**

### **1. Através das Configurações** ⚙️

1. Abra o **Krigzis**
2. Vá em **Configurações** (ícone de engrenagem)
3. Role até a seção **"Logs e Monitoramento"**
4. Clique em **"Abrir Logs"** ou **"Ver Crash Reports"**

### **2. Logs Automáticos** 🤖

O sistema registra automaticamente:
- ✅ **Criação de tarefas** (via interface ou IA)
- ✅ **Atualizações de tarefas**
- ✅ **Criação de categorias**
- ✅ **Configurações alteradas**
- ✅ **Ações de IA** (chamadas, respostas, erros)
- ✅ **Erros do sistema**
- ✅ **Crashes da aplicação**

---

## 📋 **TIPOS DE LOGS DISPONÍVEIS**

### **🔒 Logs de Segurança**
- **Login/Logout** de usuários
- **Tentativas de acesso** não autorizadas
- **Mudanças de configuração** críticas
- **Atividades suspeitas**

### **⚡ Logs de Performance**
- **Tempo de resposta** da IA
- **Uso de memória** do sistema
- **Tempo de carregamento** de componentes
- **Métricas de performance**

### **👤 Logs de Usuário**
- **Ações do usuário** (criar, editar, deletar)
- **Navegação** entre telas
- **Preferências** alteradas
- **Interações** com a interface

### **🖥️ Logs do Sistema**
- **Inicialização** da aplicação
- **Conexão** com banco de dados
- **Eventos** do Electron
- **Configurações** do sistema

### **🤖 Logs de IA**
- **Chamadas** para APIs de IA
- **Respostas** recebidas
- **Erros** de comunicação
- **Tokens** utilizados
- **Tempo de resposta**

### **💾 Logs de Banco de Dados**
- **Operações** de leitura/escrita
- **Conexões** estabelecidas
- **Erros** de banco
- **Backups** realizados

---

## 🛡️ **CRASH REPORTS**

### **O que são?**
Relatórios detalhados de quando a aplicação "crasha" ou encontra erros críticos.

### **Informações incluídas:**
- ✅ **Detalhes do erro** (tipo, mensagem, stack trace)
- ✅ **Contexto do sistema** (memória, CPU, uptime)
- ✅ **Contexto do usuário** (última ação, session ID)
- ✅ **Informações técnicas** (versão, plataforma, arquitetura)

### **Como acessar:**
1. Configurações → **"Ver Crash Reports"**
2. Selecione um report para ver detalhes completos
3. Exporte para análise externa se necessário

---

## 📊 **FILTROS E BUSCA**

### **Por Categoria:**
- 🔒 **Segurança** - Ações de segurança e auditoria
- ⚡ **Performance** - Métricas de performance
- 👤 **Usuário** - Ações do usuário
- 🖥️ **Sistema** - Eventos do sistema
- 🤖 **IA** - Interações com IA
- 💾 **Banco** - Operações de banco

### **Por Nível:**
- 🟢 **Info** - Informações gerais
- 🟡 **Warn** - Avisos
- 🔴 **Error** - Erros
- 🔍 **Debug** - Informações de debug

---

## 📤 **EXPORTAÇÃO DE DADOS**

### **Exportar Logs:**
1. Abra o **Visualizador de Logs**
2. Aplique filtros se necessário
3. Clique em **"Exportar"**
4. Arquivo JSON será baixado

### **Exportar Crash Reports:**
1. Abra o **Crash Report Viewer**
2. Selecione reports desejados
3. Clique em **"Exportar"**
4. Arquivo JSON será baixado

### **Formato dos Dados:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Tarefa criada via IA",
  "category": "ai",
  "data": {
    "taskId": 123,
    "provider": "openai",
    "tokensUsed": 150
  }
}
```

---

## 🛡️ **PRIVACIDADE E SEGURANÇA**

### **Dados Protegidos:**
- ✅ **API Keys** - Nunca logadas
- ✅ **Senhas** - Nunca logadas
- ✅ **Tokens** - Redatados automaticamente
- ✅ **Dados pessoais** - Sanitizados

### **Armazenamento:**
- 📁 **Logs**: `%APPDATA%/Krigzis/logs/`
- 📁 **Crash Reports**: `%APPDATA%/Krigzis/crash-reports/`
- 🔒 **Local apenas** - Nada enviado para servidores
- 🗑️ **Limpeza automática** - Logs antigos removidos

### **Retenção:**
- 📅 **Logs**: 30 dias por padrão
- 📅 **Crash Reports**: Máximo 10 arquivos
- 🔄 **Limpeza automática** configurável

---

## ⚙️ **CONFIGURAÇÕES AVANÇADAS**

### **Habilitar/Desabilitar Categorias:**
```typescript
// No localStorage (configuração avançada)
{
  "krigzis-log-config": {
    "categories": {
      "security": true,
      "performance": true,
      "user": true,
      "system": true,
      "ai": true,
      "database": true
    }
  }
}
```

### **Alterar Nível de Log:**
- **Debug**: Todos os logs (desenvolvimento)
- **Info**: Logs informativos (padrão)
- **Warn**: Apenas avisos e erros
- **Error**: Apenas erros

---

## 🔧 **COMANDOS ÚTEIS**

### **Via Terminal:**
```bash
# Verificar logs em tempo real
tail -f "%APPDATA%/Krigzis/logs/krigzis-2024-01-15.log"

# Contar logs por categoria
grep -c "category.*security" "%APPDATA%/Krigzis/logs/"*.log

# Buscar erros específicos
grep "ERROR" "%APPDATA%/Krigzis/logs/"*.log
```

### **Via Interface:**
- 🔍 **Filtros** em tempo real
- 📊 **Estatísticas** de logs
- 📤 **Exportação** seletiva
- 🗑️ **Limpeza** automática

---

## 🚨 **ALERTAS E NOTIFICAÇÕES**

### **Alertas Automáticos:**
- 🔴 **Crashes** - Notificação imediata
- 🟡 **Erros críticos** - Log detalhado
- 🟢 **Performance** - Métricas em tempo real
- 🔒 **Segurança** - Atividades suspeitas

### **Configurar Alertas:**
1. Configurações → **"Notificações"**
2. Ative **"Alertas de Sistema"**
3. Configure **"Nível de Alerta"**

---

## 📈 **MÉTRICAS E ESTATÍSTICAS**

### **Métricas Disponíveis:**
- 📊 **Total de logs** por categoria
- ⏱️ **Tempo médio** de resposta da IA
- 💾 **Uso de memória** do sistema
- 🔄 **Taxa de erro** por funcionalidade
- 👤 **Ações mais comuns** do usuário

### **Visualização:**
- 📈 **Gráficos** temporais
- 📊 **Distribuição** por categoria
- 🔍 **Tendências** de uso
- ⚠️ **Picos** de erro

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **Logs não aparecem:**
1. Verifique se o sistema está **habilitado**
2. Confirme **permissões** de escrita
3. Reinicie a aplicação
4. Verifique **espaço em disco**

### **Crash Reports vazios:**
1. A aplicação não crashou ainda
2. Verifique **configurações** de crash reporting
3. Teste com **erro forçado** (desenvolvimento)

### **Performance lenta:**
1. Verifique **logs de performance**
2. Analise **uso de memória**
3. Considere **limpar logs antigos**
4. Desabilite **categorias desnecessárias**

---

## 🎯 **EXEMPLOS PRÁTICOS**

### **Exemplo 1: Debug de IA**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Chamada de IA realizada",
  "category": "ai",
  "data": {
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "tokensUsed": 150,
    "responseTime": 1200,
    "success": true
  }
}
```

### **Exemplo 2: Crash Report**
```json
{
  "id": "crash-1234567890",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "name": "TypeError",
    "message": "Cannot read property of undefined",
    "stack": "at TaskList.render..."
  },
  "context": {
    "memoryUsage": { "rss": 123456789 },
    "uptime": 3600
  }
}
```

---

## ✅ **CHECKLIST DE USO**

### **Configuração Inicial:**
- [x] Acessar configurações
- [x] Verificar se logging está habilitado
- [x] Configurar categorias desejadas
- [x] Definir nível de log apropriado

### **Uso Diário:**
- [x] Verificar logs periodicamente
- [x] Monitorar crash reports
- [x] Exportar dados quando necessário
- [x] Limpar logs antigos

### **Manutenção:**
- [x] Revisar configurações mensalmente
- [x] Verificar espaço em disco
- [x] Atualizar configurações de segurança
- [x] Backup de logs importantes

---

**Status**: 🟢 **SISTEMA OPERACIONAL** - Pronto para uso! 