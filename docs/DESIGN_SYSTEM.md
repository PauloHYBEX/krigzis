# Design System - Task Manager

## 🎨 Visão Geral

Design minimalista focado em produtividade, com tema escuro como padrão e elementos visuais sutis que não distraem o usuário durante o trabalho.

## 🎭 Princípios de Design

### 1. Minimalismo Funcional
- Cada elemento tem um propósito claro
- Sem decorações desnecessárias
- Foco na usabilidade

### 2. Hierarquia Visual Clara
- Uso estratégico de tamanhos e pesos de fonte
- Espaçamento consistente
- Contraste adequado para legibilidade

### 3. Feedback Visual Sutil
- Transições suaves (200-300ms)
- Estados hover discretos
- Animações que não distraem

## 🎨 Paleta de Cores

### Cores Base (Tema Escuro)
```css
:root {
  /* Backgrounds */
  --bg-primary: #0A0A0A;      /* Fundo principal */
  --bg-secondary: #141414;    /* Cards e surfaces */
  --bg-tertiary: #1F1F1F;     /* Hover states */
  --bg-elevated: #2A2A2A;     /* Modais e popups */
  
  /* Bordas */
  --border-subtle: #2A2A2A;   /* Bordas sutis */
  --border-default: #333333;  /* Bordas padrão */
  --border-strong: #4A4A4A;   /* Bordas de foco */
  
  /* Textos */
  --text-primary: #FFFFFF;    /* Texto principal */
  --text-secondary: #A0A0A0;  /* Texto secundário */
  --text-tertiary: #707070;   /* Texto desabilitado */
  --text-inverse: #0A0A0A;   /* Texto em fundos claros */
}
```

### Cores de Marca
```css
:root {
  /* Gradiente Principal */
  --gradient-primary: linear-gradient(135deg, #00D4AA 0%, #00A383 100%);
  --gradient-secondary: linear-gradient(135deg, #7B3FF2 0%, #5A2BB8 100%);
  
  /* Cores Sólidas */
  --color-primary: #00D4AA;     /* Verde água */
  --color-primary-dark: #00A383;
  --color-secondary: #7B3FF2;   /* Roxo vibrante */
  --color-secondary-dark: #5A2BB8;
  
  /* Estados */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
}
```

### Gradientes Especiais
```css
/* Gradiente para elementos destacados */
.gradient-glow {
  background: linear-gradient(
    135deg,
    rgba(0, 212, 170, 0.1) 0%,
    rgba(123, 63, 242, 0.1) 100%
  );
  backdrop-filter: blur(10px);
}

/* Gradiente para botões primários */
.gradient-button {
  background: linear-gradient(135deg, #00D4AA 0%, #00A383 100%);
  transition: all 0.3s ease;
}

.gradient-button:hover {
  background: linear-gradient(135deg, #00E4BA 0%, #00B393 100%);
  box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
}
```

## 📐 Tipografia

### Família de Fontes
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

### Escala Tipográfica
```css
/* Headings */
.text-h1 {
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-h2 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.text-h3 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

/* Body */
.text-body-lg {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

.text-body {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}

.text-body-sm {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
}

/* Special */
.text-mono {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 20px;
}
```

## 🔲 Espaçamento

### Sistema de Grid (8px base)
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

## 🧩 Componentes

### Botões

#### Botão Primário
```css
.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Botão Secundário
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  border: 1px solid var(--border-default);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-strong);
}
```

### Cards

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--border-default);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  cursor: grabbing;
}
```

### Inputs

```css
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Listas de Tarefas

```css
.task-list {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: var(--space-4);
  min-height: 400px;
}

.task-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(2px);
}

.task-item-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}
```

## 🎬 Animações

### Transições Padrão
```css
/* Transição rápida para interações */
.transition-fast {
  transition: all 0.15s ease;
}

/* Transição normal */
.transition-normal {
  transition: all 0.2s ease;
}

/* Transição suave para elementos maiores */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animações de Entrada
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 🌓 Tema Claro (Opcional)

```css
[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F7F7;
  --bg-tertiary: #EFEFEF;
  --bg-elevated: #FFFFFF;
  
  --border-subtle: #E0E0E0;
  --border-default: #D0D0D0;
  --border-strong: #B0B0B0;
  
  --text-primary: #0A0A0A;
  --text-secondary: #505050;
  --text-tertiary: #808080;
  --text-inverse: #FFFFFF;
  
  /* Ajuste de sombras */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

## 📱 Breakpoints

```css
:root {
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
}

/* Uso */
@media (min-width: 768px) {
  .container {
    max-width: 1200px;
  }
}
```

## 🎯 Estados Interativos

### Focus States
```css
.focusable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Loading States
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Error States
```css
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}
```

---

**Versão**: 1.0.0
**Última Atualização**: ${new Date().toLocaleDateString('pt-BR')} 