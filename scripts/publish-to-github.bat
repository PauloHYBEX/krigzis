@echo off
title Krigzis - Publicação no GitHub
color 0A

echo.
echo ================================
echo   🚀 KRIGZIS - PUBLICACAO GITHUB
echo ================================
echo.

REM Verificar se Git está instalado
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git não está instalado!
    echo.
    echo Para continuar, instale o Git:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo ✅ Git encontrado!
echo.

REM Verificar se é um repositório Git
if not exist .git (
    echo 📝 Inicializando repositório Git...
    git init
    echo ✅ Repositório Git inicializado!
    echo.
) else (
    echo ✅ Repositório Git já existe!
    echo.
)

REM Verificar se remote origin existe
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 🔗 Configurando repositório remoto...
    git remote add origin https://github.com/PauloHYBEX/krigzis.git
    echo ✅ Repositório remoto configurado!
    echo.
) else (
    echo ✅ Repositório remoto já configurado!
    echo.
)

REM Mostrar status
echo 📋 Status atual do repositório:
git status --short
echo.

REM Perguntar se deve continuar
set /p continue="🤔 Deseja fazer commit e push de todas as alterações? (s/n): "
if /i not "%continue%"=="s" (
    echo ❌ Operação cancelada pelo usuário.
    pause
    exit /b 0
)

echo.
echo 📦 Adicionando arquivos...
git add .

echo ✅ Arquivos adicionados!
echo.

REM Fazer commit
echo 💬 Fazendo commit...
git commit -m "🎉 Commit inicial: Krigzis v1.0.0

✨ Funcionalidades implementadas:
- ✅ Sistema completo de gerenciamento de tarefas
- ✅ Timer Pomodoro integrado
- ✅ Sistema de notas vinculadas
- ✅ Assistente IA configurável
- ✅ Interface moderna com tema dark
- ✅ Sistema de atualizações automáticas
- ✅ Relatórios e estatísticas
- ✅ Distribuição portável sem instalação

🔧 Tecnologias:
- Electron 26.6.10
- React 18+
- TypeScript 5+
- Webpack 5
- CSS3 com variáveis customizadas

📦 Build:
- Sistema de distribuição manual
- Contorna problemas de permissões
- Auto-instala dependências
- Funciona sem privilégios de admin"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro no commit! Verifique se há alterações para commitar.
    pause
    exit /b 1
)

echo ✅ Commit realizado!
echo.

REM Configurar branch principal
echo 🌿 Configurando branch principal...
git branch -M main

REM Fazer push
echo 🚀 Enviando para GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro no push! Possíveis causas:
    echo   • Você não tem permissão de escrita no repositório
    echo   • O repositório não existe no GitHub
    echo   • Problemas de autenticação
    echo.
    echo 💡 Soluções:
    echo   1. Crie o repositório manualmente no GitHub:
    echo      https://github.com/new
    echo   2. Configure suas credenciais Git
    echo   3. Verifique se tem acesso ao repositório
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Push realizado com sucesso!
echo.

REM Criar release
echo 📦 Gerando release...
node scripts/create-release.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao gerar release!
    pause
    exit /b 1
)

echo.
echo 🎉 SUCESSO! Seu código foi enviado para o GitHub!
echo.
echo 📋 Próximos passos MANUAIS:
echo   1. Acesse: https://github.com/PauloHYBEX/krigzis
echo   2. Clique em "Releases" ^> "Create a new release"
echo   3. Use a tag: v1.0.0
echo   4. Faça upload do arquivo: releases\Krigzis-v1.0.0-Windows-Portable.zip
echo   5. Copie a descrição do arquivo: releases\CHANGELOG-v1.0.0.md
echo.
echo 🚀 Link do seu repositório:
echo    https://github.com/PauloHYBEX/krigzis
echo.

pause