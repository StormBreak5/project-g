# 🕵️ Quem Sou Eu? - Cyber Deduction Game

> Um jogo de dedução social presencial ("Sofá-game"), onde o app gerencia os segredos e a pontuação, enquanto a interação acontece cara a cara.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Platform](https://img.shields.io/badge/Plataforma-Mobile_First-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📱 Sobre o Projeto

O **Quem Sou Eu?** é uma modernização digital de jogos de tabuleiro clássicos como "Cara a Cara" e "Perfil". Ele foi desenhado para ser jogado por **pessoas no mesmo ambiente físico** (Mobile First).

O software atua como o **Mediador Imparcial**:
1. Distribui os personagens secretos para os celulares de cada jogador
2. Gerencia a economia de pontos (Risco vs. Recompensa)
3. Sincroniza o estado da partida em tempo real via WebSockets

**Nota:** Não há chat de texto ou voz no app. A graça do jogo é a conversa, o blefe e a dedução feita ao vivo, olhando nos olhos do oponente!

## 🛠️ Tech Stack

A arquitetura foi pensada para alta performance em atualizações de tempo real e componentização moderna.

### Frontend (Mobile Web)
* **Framework:** [Next.js 16.1.1](https://nextjs.org/) (App Router)
* **Linguagem:** TypeScript 5
* **UI Library:** React 19.2.3
* **Estilização:** Tailwind CSS 4 (Mobile First + Design System "Cyber-Deduction")
* **Comunicação:** Socket.io-client 4.8.3
* **Design Pattern:** Component-Based Architecture

### Backend (API & Game Server)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Protocolo:** WebSockets (Async/Await)
* **Gerenciador:** Python-SocketIO

---

## 🎨 Design System

O projeto utiliza o design system **"Cyber-Deduction"**, com paleta de cores vibrantes e efeitos modernos:

- **Paleta:** Roxo Neon (#A855F7) + Rosa Hot (#EC4899) sobre fundo escuro (#09090B)
- **Efeitos:** Glassmorphism, gradientes animados, micro-animações
- **Tipografia:** Geist Sans + Geist Mono
- **Princípios:** Premium, moderno, alto contraste, feedback visual constante

📄 Documentação completa: [`frontend/DESIGN_SYSTEM.md`](frontend/DESIGN_SYSTEM.md)

---

## 📂 Estrutura do Projeto

```bash
project-guess/
├── backend/                    # Servidor Python (FastAPI)
│   ├── main.py                 # Entry point, WebSocket e rotas
│   ├── venv/                   # Ambiente virtual Python
│   └── __pycache__/            # Cache Python
│
├── frontend/                   # Cliente Next.js
│   ├── app/                    # Rotas (Next.js App Router)
│   │   ├── page.tsx            # Página inicial (Lobby)
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── globals.css         # Estilos globais + variáveis CSS
│   │   └── game/
│   │       └── [roomId]/       # Página dinâmica da sala de jogo
│   │           ├── page.tsx    # Server Component
│   │           └── GamePageClient.tsx  # Client Component
│   │
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes de UI base
│   │   └── game/               # Componentes específicos do jogo
│   │
│   ├── hooks/                  # Custom Hooks
│   │   └── useSocket.ts        # Hook de conexão WebSocket
│   │
│   ├── types/                  # Definições TypeScript
│   │
│   ├── public/                 # Arquivos estáticos
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   │
│   ├── DESIGN_SYSTEM.md        # Documentação do Design System
│   ├── package.json            # Dependências Node.js
│   ├── tsconfig.json           # Configuração TypeScript
│   ├── next.config.ts          # Configuração Next.js
│   ├── postcss.config.mjs      # Configuração PostCSS
│   └── eslint.config.mjs       # Configuração ESLint
│
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Este arquivo
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Python 3.8+** (para o backend)
- **Node.js 18+** (para o frontend)
- **npm** ou **yarn**

### 1. Backend (Python API)

O backend será o "mestre do jogo".

```bash
# 1. Navegue até a pasta do servidor
cd backend

# 2. Crie o ambiente virtual
python -m venv venv

# 3. Ative o ambiente
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# 4. Instale as dependências
pip install fastapi uvicorn python-socketio

# 5. Inicie o servidor
# Para desenvolvimento local:
uvicorn main:app --reload

# Para permitir acesso na rede local (LAN Party):
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

O servidor estará rodando em:
- Local: `http://localhost:8000`
- Rede: `http://SEU_IP:8000`

### 2. Frontend (Next.js)

O frontend é a interface que aparecerá nos celulares.

```bash
# 1. Navegue até a pasta frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# O app estará disponível em http://localhost:3000
```

### 3. Como Conectar os Celulares 📱

Para jogar com amigos na mesma sala usando celulares:

#### 1. Descubra seu IP Local:

**Windows:**
```bash
ipconfig
# Procure por "Endereço IPv4" (ex: 192.168.1.15)
```

**Linux/Mac:**
```bash
ifconfig
# ou
ip a
```

#### 2. Conecte os Celulares:

1. Garanta que todos estão no **mesmo Wi-Fi**
2. Abra o navegador do celular (Chrome/Safari)
3. Acesse: `http://SEU_IP:3000` (Exemplo: `http://192.168.1.15:3000`)

---

## 🎮 Como Jogar

### 1. Criar/Entrar em uma Sala
- Na página inicial, digite seu apelido
- Crie uma nova sala ou entre em uma existente com o código

### 2. Aguardar Jogadores
- Compartilhe o código da sala com outros jogadores
- Aguarde até que todos estejam conectados

### 3. Início do Jogo
- Cada jogador recebe um personagem secreto
- O objetivo é descobrir o personagem do oponente

### 4. Investigação
- Faça perguntas ao oponente verbalmente
- Cada pergunta custa **-50 pontos**
- Use dedução e estratégia para descobrir o personagem

### 5. Palpite
- Quando tiver certeza, faça seu palpite
- Acertar: **Vitória!** 🎉
- Errar: **-150 pontos** (penalidade)

### 6. Vitória
- Ganha quem descobrir o personagem do oponente primeiro
- Mantenha pontos positivos para vencer!

---

## 🎨 Features Implementadas

- ✅ Sistema de salas com códigos únicos
- ✅ Conexão em tempo real via WebSockets
- ✅ Design responsivo (Mobile First)
- ✅ Sistema de pontuação
- ✅ Distribuição aleatória de personagens
- ✅ Interface moderna com Cyber-Deduction Design System
- ✅ Efeitos visuais premium (glassmorphism, gradientes, animações)
- ✅ Feedback visual em todas as interações

---

## 🌉 Roadmap / Futuro do Projeto

- [ ] **Modo Multiplayer (3+ jogadores):** Suporte para mais de 2 jogadores por sala
- [ ] **QR Code no Lobby:** Gerar QR Code para facilitar entrada na sala
- [ ] **Modo Espectador:** Permitir que terceiros assistam a partida
- [ ] **Categorias de Personagens:** Animes, Celebridades, História, Filmes, etc.
- [ ] **Sistema de Ranking:** Placar global de vitórias
- [ ] **Animações de Vitória/Derrota:** Confetes, efeitos especiais
- [ ] **Chat de Texto (Opcional):** Para jogadores remotos
- [ ] **Modo "Hotseat":** Passar o celular entre jogadores
- [ ] **PWA (Progressive Web App):** Instalação no celular
- [ ] **Histórico de Partidas:** Ver partidas anteriores
- [ ] **Customização de Avatares:** Personalização visual

---

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o Python 3.8+ está instalado: `python --version`
- Certifique-se de que o ambiente virtual está ativado
- Reinstale as dependências: `pip install -r requirements.txt`

### Frontend não conecta ao backend
- Verifique se o backend está rodando em `http://localhost:8000`
- Confira a configuração do Socket.io no arquivo `useSocket.ts`
- Verifique o console do navegador para erros de CORS

### Celulares não conseguem conectar
- Certifique-se de que todos estão no mesmo Wi-Fi
- Verifique se o firewall não está bloqueando as portas 3000 e 8000
- Confirme que o backend está rodando com `--host 0.0.0.0`

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👤 Autor

Projeto desenvolvido com **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS 4** e **FastAPI**, focado em componentização moderna, design premium e comunicação Real-Time via WebSockets.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

**Divirta-se jogando! 🎮🕵️**