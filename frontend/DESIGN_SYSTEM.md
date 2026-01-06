# 🎨 Design System - "Cyber-Deduction"

Este documento descreve o sistema de design completo da aplicação "Quem Sou Eu?", incluindo paleta de cores, tipografia, componentes e diretrizes de uso.

---

## 🌈 Paleta de Cores

### Background
| Função | Cor Visual | Código HEX | Classe Tailwind | Onde usar? |
|--------|-----------|------------|-----------------|------------|
| **Background** | ⬛ Preto Profundo | `#09090B` | `bg-neutral-950` | Fundo geral da tela |
| **Superfície** | ⬛ Cinza Vidro | `#18181B` | `bg-zinc-900` | Cartões, modais e inputs (com opacidade) |

### Cores Primárias
| Função | Cor Visual | Código HEX | Classe Tailwind | Onde usar? |
|--------|-----------|------------|-----------------|------------|
| **Primária** | 🟣 Roxo Neon | `#A855F7` | `text-purple-500` | Começo do gradiente, ícones ativos |
| **Secundária** | 🌸 Rosa Hot | `#EC4899` | `text-pink-500` | Fim do gradiente, botões de ação |

### Texto
| Função | Cor Visual | Código HEX | Classe Tailwind | Onde usar? |
|--------|-----------|------------|-----------------|------------|
| **Texto Base** | ⬜ Branco Gelo | `#FAFAFA` | `text-neutral-50` | Títulos, apelidos e placar |
| **Texto Mudo** | ⬜ Cinza | `#A1A1AA` | `text-zinc-400` | Legendas, placeholders, instruções |

### Status
| Função | Cor Visual | Código HEX | Classe Tailwind | Onde usar? |
|--------|-----------|------------|-----------------|------------|
| **Sucesso** | 🟢 Verde Luz | `#4ADE80` | `text-green-400` | Status online, mensagem de vitória |
| **Erro/Perigo** | 🔴 Vermelho | `#EF4444` | `text-red-500` | Mensagens de erro, botão de perder pontos |

---

## 📐 Variáveis CSS

As cores estão definidas como variáveis CSS no arquivo `globals.css`:

```css
:root {
  /* Background */
  --bg-deep: #09090B;
  --bg-surface: #18181B;
  
  /* Cores Primárias */
  --primary-neon: #A855F7;
  --secondary-hot: #EC4899;
  
  /* Texto */
  --text-base: #FAFAFA;
  --text-muted: #A1A1AA;
  
  /* Status */
  --success: #4ADE80;
  --error: #EF4444;
}
```

### Uso das Variáveis

```tsx
// Em componentes React/TSX
<div className="text-[var(--primary-neon)]">Texto roxo neon</div>
<div className="bg-[var(--bg-surface)]">Fundo de superfície</div>
```

---

## 🎭 Classes Utilitárias Customizadas

### Gradientes

#### `.gradient-primary`
Gradiente principal roxo → rosa
```css
background: linear-gradient(135deg, var(--primary-neon) 0%, var(--secondary-hot) 100%);
```
**Uso:** Botões principais, badges, elementos de destaque

#### `.gradient-surface`
Gradiente sutil para fundos
```css
background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
```
**Uso:** Fundos de cards, áreas de conteúdo

### Efeitos

#### `.glass-effect`
Efeito de glassmorphism (vidro fosco)
```css
background: rgba(24, 24, 27, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(168, 85, 247, 0.2);
```
**Uso:** Cards principais, modais, containers

#### `.text-gradient`
Texto com gradiente
```css
background: linear-gradient(135deg, var(--primary-neon) 0%, var(--secondary-hot) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```
**Uso:** Títulos principais, textos de destaque

### Animações

#### `.animate-glow`
Efeito de brilho pulsante
```css
animation: glow 2s ease-in-out infinite;
```
**Uso:** Botões ativos, elementos interativos

#### `.animate-pulse-slow`
Pulsação lenta e suave
```css
animation: pulse-slow 3s ease-in-out infinite;
```
**Uso:** Efeitos de fundo, elementos decorativos

---

## 🔤 Tipografia

### Fontes
- **Sans-serif**: Geist Sans (variável `--font-geist-sans`)
- **Monospace**: Geist Mono (variável `--font-geist-mono`)

### Hierarquia de Texto

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| **H1 Principal** | `text-5xl` (3rem) | `font-bold` | Título "QUEM SOU EU?" |
| **H1 Secundário** | `text-3xl` (1.875rem) | `font-bold` | Títulos de página |
| **H2** | `text-2xl` (1.5rem) | `font-bold` | Subtítulos |
| **Body** | `text-base` (1rem) | `font-normal` | Texto padrão |
| **Small** | `text-sm` (0.875rem) | `font-normal` | Legendas, descrições |
| **Tiny** | `text-xs` (0.75rem) | `font-medium` | Status, badges |

---

## 🧩 Componentes

### Botão Principal
```tsx
<button className="w-full gradient-primary py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
  ENTRAR
</button>
```

### Input com Ícone
```tsx
<div className="relative">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-neon)]">
    {/* Ícone SVG */}
  </div>
  <input
    type="text"
    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-surface)] border border-zinc-800 text-[var(--text-base)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-neon)]/20 transition-all"
  />
</div>
```

### Card com Glassmorphism
```tsx
<div className="glass-effect rounded-3xl p-8 shadow-2xl">
  {/* Conteúdo */}
</div>
```

### Badge de Status
```tsx
<div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-green-500/20 text-[var(--success)] border border-green-500/30">
  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
  Online
</div>
```

---

## 🎨 Background Animado

Padrão de fundo com gradiente e efeitos de luz:

```tsx
<div className="min-h-screen relative overflow-hidden">
  {/* Gradiente base */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#09090B] to-pink-900/20"></div>
  
  {/* Efeitos de luz */}
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
  
  {/* Conteúdo */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</div>
```

---

## 📱 Responsividade

### Breakpoints Tailwind
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Diretrizes
- Mobile-first: Design otimizado para mobile por padrão
- Desktop: Usar `md:` e `lg:` para ajustes em telas maiores
- Espaçamento: `p-4` no mobile, `md:p-8` no desktop
- Tamanhos de fonte: Aumentar em telas maiores quando apropriado

---

## ✨ Princípios de Design

1. **Premium e Moderno**: Use gradientes, glassmorphism e animações suaves
2. **Contraste Alto**: Garanta legibilidade com cores vibrantes sobre fundos escuros
3. **Feedback Visual**: Sempre forneça feedback em interações (hover, active, disabled)
4. **Consistência**: Use as classes utilitárias customizadas para manter consistência
5. **Acessibilidade**: Mantenha contraste adequado e tamanhos de fonte legíveis

---

## 🔧 Manutenção

Para adicionar novas cores ou utilitários:

1. Adicione a variável CSS em `globals.css` na seção `:root`
2. Crie a classe utilitária correspondente
3. Documente neste arquivo
4. Use `var(--nome-da-variavel)` em classes Tailwind com `[]`

**Exemplo:**
```css
/* globals.css */
:root {
  --accent-blue: #3B82F6;
}

.gradient-blue {
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--primary-neon) 100%);
}
```

```tsx
// Uso em componente
<div className="text-[var(--accent-blue)]">Texto azul</div>
```
