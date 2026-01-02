# 🕵️ [NOME DO PROJETO]

> Um jogo de dedução social presencial ("Sofá-game"), onde o app gerencia os segredos e a pontuação, enquanto a interação acontece cara a cara.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Platform](https://img.shields.io/badge/Plataforma-Mobile_First-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📱 Sobre o Projeto

O **[NOME DO PROJETO]** é uma modernização digital de jogos de tabuleiro clássicos como "Cara a Cara" e "Perfil". Ele foi desenhado para ser jogado por **pessoas no mesmo ambiente físico** (Mobile First).

O software atua como o **Mediador Imparcial**:
1.  Distribui os personagens secretos para os celulares de cada jogador.
2.  Gerencia a economia de pontos (Risco vs. Recompensa).
3.  Sincroniza o estado da partida em tempo real via WebSockets.

**Nota:** Não há chat de texto ou voz no app. A graça do jogo é a conversa, o blefe e a dedução feita ao vivo, olhando nos olhos do oponente!

## 🛠️ Tech Stack

A arquitetura foi pensada para alta performance em atualizações de tempo real e componentização moderna.

### Frontend (Mobile Web)
* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS (Focado em responsividade Mobile)
* **Comunicação:** Socket.io-client
* **Design Pattern:** Atomic Design / Component-Based Architecture

### Backend (API & Game Server)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Protocolo:** WebSockets (Async/Await)
* **Gerenciador:** Python-SocketIO

---

## 📂 Estrutura do Projeto

O projeto segue uma organização limpa, separando a interface (UI) da lógica de negócios (Hooks/API).

```bash
/
├── backend/              # Servidor Python (FastAPI)
│   ├── main.py           # Entry point e configuração de Socket
│   └── game_logic.py     # Regras de negócio e estado das salas
│
└── frontend/             # Cliente Next.js
    ├── app/              # Rotas (Next.js App Router)
    │   ├── game/[id]/    # Tela da Partida (Mobile View)
    │   └── page.tsx      # Lobby / Entrada
    ├── components/       # Componentes Reutilizáveis
    │   ├── ui/           # Botões, Cards, Inputs
    │   └── game/         # Placar, Carta Secreta, Painel de Ação
    ├── hooks/            # Lógica de conexão (useSocket.ts)
    └── types/            # Tipagem compartilhada (Interfaces)
```

## 🚀 Como Rodar Localmente (LAN Party)

Para jogar com amigos na mesma sala usando celulares, o servidor precisa estar acessível na sua rede Wi-Fi local.

### 1. Backend (Python API)

O backend será o "mestre do jogo".

```bash
# 1. Navegue até a pasta do servidor (crie-a se ainda não existir fora do frontend)
cd backend

# 2. Crie o ambiente virtual
python -m venv venv

# 3. Ative o ambiente
# Windows (PowerShell):
.\venv\Scripts\Activate
# Linux/Mac:
source venv/bin/activate

# 4. Instale as dependências
pip install fastapi uvicorn python-socketio

# 5. INICIE O SERVIDOR PARA A REDE (Importante!)
# O --host 0.0.0.0 permite que outros dispositivos na rede acessem seu PC
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Next.js)

O frontend é a interface que aparecerá nos celulares.

```bash
# 1. Navegue até a pasta frontend (baseado na sua imagem)
cd frontend

# 2. Instale as dependências do Node
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

### 3. Como Conectar os Celulares 📱

Como o jogo não tem internet global (cloud), seus amigos precisam se conectar ao IP do seu computador.

#### 1. Descubra seu IP Local:

* **Windows:** Abra o terminal e digite `ipconfig`. Procure por `Endereço IPv4` (ex: `192.168.1.15`).
* **Linux/Mac:** Digite `ifconfig` ou `ip a`.

#### 2. Conecte os Celulares:

* Garanta que todos estão no **mesmo Wi-Fi**.
* Abra o navegador do celular (Chrome/Safari).
* Acesse: `http://SEU_IP_AQUI:3000` (Exemplo: `http://192.168.1.15:3000`).

---

## 🎮 Dinâmica da Partida (Regras)

O app serve apenas como **controle de pontuação e segredos**. A interação real acontece verbalmente entre os jogadores.

### 1. Setup:
Dois jogadores entram na sala pelo celular.

### 2. Sorteio:
O sistema entrega um personagem secreto para cada um (ex: *Mario* vs *Sonic*).

### 3. Investigação (Cara a Cara):

* Os jogadores fazem perguntas um ao outro falando normalmente.
* Ao fazer uma pergunta (**"O seu personagem é humano?"**), o jogador deve tocar no botão **[-50 Pontos]** no app.

### 4. O Risco:

* Se o jogador quiser arriscar um palpite e errar, deve punir a si mesmo tocando em **[-150 Pontos]**.

### 5. Vitória:

* Ganha quem descobrir o personagem do oponente primeiro e tocar em **[ACERTEI!]**, desde que ainda tenha pontos positivos.

---

## 🌉 Futuro do Projeto

* **[ ] Modo "Hotseat" (Passar o celular) para grupos maiores.**
* **[ ] QR Code no Lobby:** Gerar um QR Code na tela do PC para os amigos escanearem e entrarem rápido.
* **[ ] Modo Espectador:** Permitir que uma terceira pessoa veja os dois segredos na TV.
* **[ ] Categorias:** Adicionar seletor de decks (Animes, Celebridades, História).
* **[ ] Animações de vitória/derrota com confetes CSS.**

---

## 👤 Autor

Projeto desenvolvido com **Next.js (App Router)** e **FastAPI** focado em componentização e comunicação Real-Time via WebSockets.