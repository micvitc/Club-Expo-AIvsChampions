# poke-ai

An LLM-powered Pokémon battle AI that plays Generation 9 National Dex OU (No Tera) on Pokémon Showdown. Uses a hybrid approach — heuristic move scoring for fast decisions, LLM (Gemini / Ollama / Puter) for strategic reasoning.

## Architecture

```
start.sh → AI.py → assistant_player.py → battle_hybrid.py (heuristic scorer)
                                         → llm_client.py (Gemini/Ollama/Puter)
                                         → prompt_builder.py + prompt.txt
```

- **`AI.py`** — Entry point. Starts a local Pokémon Showdown server, logs in as "Blue AI", and waits for browser challenges.
- **`assistant_player.py`** — Core player loop. Handles team preview, move selection, browser commands (difficulty, rematch, provider toggle).
- **`battle_hybrid.py`** — Heuristic engine that scores moves and switches. The LLM sees a ranked shortlist and picks the best action.
- **`llm_client.py`** — Three backends: Google Gemini, Ollama (local), or Puter API.
- **`prompt_builder.py`** + **`prompt.txt`** — Dynamically builds battle-state prompts with type charts, field conditions, and action rankings.

## Quick Start

```bash
# Install Python deps
pip install -r requirements.txt

# Build Showdown (Node.js)
cd pokemon-showdown && npm install && node build

# Run
python AI.py --provider puter
# or
python AI.py --provider gemini
# or
python AI.py --provider ollama --model qwen2.5:7b
```

Open `http://localhost:8000/` in a browser, pick a difficulty, and battle.

## CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `--provider` / `-p` | `puter` | LLM backend: `gemini`, `ollama`, `puter` |
| `--model` / `-m` | `qwen2.5:7b` | Ollama model name |
| `--puter-model` | `claude-3-5-sonnet` | Puter model name |
| `--server` / `-s` | `localhost` | `localhost` or `showdown` (remote) |
| `--wizard` / `-w` | — | Interactive setup wizard |

## Deployment

Deployed on Render via Docker:

```
render.yaml → Dockerfile → start.sh → AI.py
```

The Docker build compiles Showdown TypeScript. The runtime `--skip-build` flag avoids recompilation. Set `GEMINI_API_KEY` and `PORT` as environment variables.

## Web Client

The Pokémon Showdown client is customized with a dark "MIC" theme (`custom.css`), a difficulty overlay (`custom-override.js`), and an AI-thinking indicator. Players select difficulty (Easy/Medium/Hard), toggle Puter mode, and auto-accept challenges from Blue AI.
