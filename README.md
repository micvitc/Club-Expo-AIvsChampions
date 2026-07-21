# poke-ai

An LLM-powered Pokémon battle AI that plays Generation 9 National Dex OU (No Tera) on Pokémon Showdown. Uses a hybrid approach — heuristic move scoring for fast decisions, LLM (Gemini / Ollama / Puter) for strategic reasoning.

## Prerequisites

- **Python 3.10+**
- **Node.js 22+**
- **npm**
- **Git**

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/micvitc/Club-Expo-AIvsChampions.git
cd Club-Expo-AIvsChampions
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

It's recommended to use a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Build Pokémon Showdown

```bash
cd pokemon-showdown
npm install
node build
cd ..
```

The `node build` command compiles TypeScript source files (including `sim/`, `lib/`, `server/`) into the `dist/` directory.

### 4. Configure

Create the Showdown config file:

```bash
cp pokemon-showdown/config/config-example.js pokemon-showdown/config/config.js
```

Then edit `pokemon-showdown/config/config.js` if needed (defaults work for local play).

### 5. Run

```bash
python AI.py --provider puter
```

Open `http://localhost:8000/` in a browser, pick a difficulty, and battle.

## LLM Providers

### Puter (default)

No setup required. Uses the Puter API with `claude-3-5-sonnet`.

```bash
python AI.py --provider puter
```

### Google Gemini

Set your API key:

```bash
export GEMINI_API_KEY="your-key-here"
python AI.py --provider gemini
```

### Ollama (local)

Requires [Ollama](https://ollama.com) running locally:

```bash
python AI.py --provider ollama --model qwen2.5:7b
```

## CLI Reference

| Flag | Default | Description |
|------|---------|-------------|
| `--provider` / `-p` | `puter` | LLM backend: `gemini`, `ollama`, `puter` |
| `--model` / `-m` | `qwen2.5:7b` | Ollama model name |
| `--puter-model` | `claude-3-5-sonnet` | Puter model name for decision-making |
| `--server` / `-s` | `localhost` | `localhost` (local Showdown) or `showdown` (remote play.pokemonshowdown.com) |
| `--wizard` / `-w` | — | Interactive setup wizard |

### Wizard mode

```bash
python AI.py --wizard
```

Walks through account setup, LLM provider selection, team building, and battle format. Config is saved to `~/.pokemon_assistant_config.json`.

### Remote server

```bash
python AI.py --provider gemini --server showdown
```

Connects to `play.pokemonshowdown.com` instead of a local server. Requires a Showdown account; provide credentials via the wizard.

## How it works

```
start.sh → AI.py → assistant_player.py → battle_hybrid.py (heuristic scorer)
                                         → llm_client.py (Gemini/Ollama/Puter)
                                         → prompt_builder.py + prompt.txt
```

1. **AI.py** starts a local Pokémon Showdown server (if needed), logs in as "Blue AI", and waits for challenges.
2. **assistant_player.py** handles team preview, move selection, and browser commands (difficulty, rematch, provider toggle).
3. **battle_hybrid.py** scores all available moves and switches heuristically, then passes a ranked shortlist to the LLM.
4. **llm_client.py** sends the battle state to the chosen LLM, which picks the best action.
5. **prompt_builder.py** assembles a detailed prompt with type chart, field conditions, and action rankings.

## Deployment

### Render (Docker)

The included `render.yaml` deploys via Docker. Set these environment variables in the Render dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (Render sets this automatically) |
| `GEMINI_API_KEY` | For Gemini | Google Gemini API key |

Deploy the `main` branch and Render builds the Docker image automatically. The Dockerfile installs both Node.js and Python dependencies, builds Showdown, and runs `start.sh`.

### Docker locally

```bash
docker build -t poke-ai .
docker run -p 8000:8000 -e GEMINI_API_KEY=your-key poke-ai
```

## Web Client

The Pokémon Showdown client is customized with:
- **Dark "MIC" theme** (`custom.css`) — glassmorphism cards, custom background, AI-thinking banner
- **Difficulty overlay** (`custom-override.js`) — Easy/Medium/Hard selection, Puter toggle, auto-accept challenges
- **Battle music** — plays `bw-rival.mp3` during battles

## Project structure

```
.
├── AI.py                         # Entry point (Blue AI)
├── assistant_player.py           # Core player loop
├── battle_hybrid.py              # Heuristic move scorer
├── llm_client.py                 # LLM clients (Gemini/Ollama/Puter)
├── prompt_builder.py             # Battle prompt assembler
├── prompt.txt                    # LLM system prompt
├── config_manager.py             # Configuration / team builder
├── play.py                       # Launcher (opens browser + runs AI)
├── start.sh                      # Production entry point
├── Dockerfile                    # Container build
├── render.yaml                   # Render deployment config
├── requirements.txt              # Python dependencies
└── pokemon-showdown/             # Pokémon Showdown server (Node.js)
    ├── lib/                      # TypeScript utilities
    ├── sim/                      # Battle simulator
    ├── server/                   # Web server
    ├── config/                   # Server configuration
    └── dist/                     # Compiled output
```
