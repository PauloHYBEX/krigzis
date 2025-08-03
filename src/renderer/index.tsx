import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './hooks/useSettings';
// import TestSimple from './TestSimple';

console.log('index.tsx loaded');

// Tratamento de erro global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const container = document.getElementById('root');
console.log('Container element:', container);

if (container) {
  console.log('Creating React 18 root...');
  try {
    const root = createRoot(container);
    root.render(
      <SettingsProvider>
        <App />
      </SettingsProvider>
    );
    console.log('App rendered successfully with React 18');
  } catch (error) {
    console.error('Error rendering app:', error);
    // Renderizar componente de erro
    container.innerHTML = `
      <div style="background-color: #1a1a1a; color: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="font-size: 48px; margin-bottom: 20px; color: #ff4444;">Erro ao carregar aplicação</h1>
        <p style="font-size: 18px; color: #ffaaaa; margin-bottom: 20px;">Ocorreu um erro ao inicializar o Krigzis.</p>
        <pre style="background-color: #2a2a2a; padding: 20px; border-radius: 8px; color: #ffcccc; max-width: 600px; overflow-x: auto;">${error}</pre>
        <p style="margin-top: 20px; color: #aaaaaa;">Verifique o console para mais detalhes.</p>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
  document.body.innerHTML = `
    <div style="background-color: #1a1a1a; color: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
      <h1 style="color: #ff4444;">Erro: Elemento root não encontrado</h1>
    </div>
  `;
} 