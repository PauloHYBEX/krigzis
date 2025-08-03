# Criação de Ícones para Krigzis

## Instruções para criar os ícones necessários:

### 1. Criar ícone principal (PNG 512x512)
- Design: Logo "K" com gradiente teal/roxo
- Fundo: Transparente
- Formato: PNG, 512x512px

### 2. Converter para outros formatos:
```bash
# Windows - ICO (usar online converter ou ImageMagick)
convert icon.png -resize 256x256 assets/icon.ico

# macOS - ICNS (usar iconutil no macOS)
iconutil -c icns icon.iconset

# Linux - PNG
cp icon.png assets/icon.png
cp icon.png assets/icon@2x.png
```

### 3. Estrutura final:
```
assets/
├── icon.ico     # Windows
├── icon.icns    # macOS  
├── icon.png     # Linux (512x512)
└── icon@2x.png  # High DPI
```

## Temporário - Ícone Placeholder
Para permitir builds imediatos, será criado um ícone placeholder simples.