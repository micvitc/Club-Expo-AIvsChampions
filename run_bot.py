#!/usr/bin/env python3
"""
Run the Pokémon Assistant bot using saved config (non-interactive).
"""
import asyncio
import os
import json
from poke_env.player import Player
from poke_env.player.battle_order import DoubleBattleOrder, SingleBattleOrder, PassBattleOrder
from poke_env.battle.battle import Battle
from poke_env.battle.double_battle import DoubleBattle
from poke_env.battle.pokemon import Pokemon
from poke_env.battle.move import Move
from poke_env.ps_client.account_configuration import AccountConfiguration
from poke_env.teambuilder.constant_teambuilder import ConstantTeambuilder
from poke_env import ServerConfiguration

# Import from the original AI.py
import sys
sys.path.insert(0, os.path.dirname(__file__))
from AI import (
    PokémonAssistant, BUILTIN_TEAM, load_config, save_config,
    AccountConfiguration, ConstantTeambuilder,
)

# Custom localhost config without online auth
LocalhostServerConfiguration = ServerConfiguration(
    websocket_url="ws://localhost:8000/showdown/websocket",
    authentication_url="",
)

CONFIG_FILE = os.path.expanduser("~/.pokemon_assistant_config.json")

async def main():
    # Load saved config
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            cfg = json.load(f)
    else:
        cfg = load_config()
    
    # Ensure required fields - use localhost
    cfg.setdefault("username", "BlueAI")
    cfg.setdefault("password", "")
    cfg.setdefault("server", "localhost")
    cfg.setdefault("format", "gen9ou")
    cfg.setdefault("num_battles", 1)
    cfg.setdefault("mode", "accept")
    cfg.setdefault("llm_provider", "ollama")
    cfg.setdefault("llm_model", "llama3")
    
    # Use built-in team if none saved
    team_str = cfg.get("last_team") or BUILTIN_TEAM
    
    print(f"Config: {cfg['username']} on {cfg['server']} playing {cfg['format']} ({cfg['mode']})")
    
    server_cfg = LocalhostServerConfiguration

    teambuilder = ConstantTeambuilder(team_str)

    bot = PokémonAssistant(
        account_configuration=AccountConfiguration(cfg["username"], cfg["password"] or None),
        battle_format=cfg["format"],
        team=teambuilder,
        server_configuration=server_cfg,
        llm_config=cfg,
    )

    print(f"\n[Bot] Bot '{cfg['username']}' is online.")
    print(f"[Bot] Team loaded.")
    print(f"[Bot] Format: {cfg['format']}")
    print(f"[Bot] Connecting to {cfg['server']}...")

    if cfg["mode"] == "accept":
        print("[Bot] Waiting for an incoming challenge...\n")
        await bot.accept_challenges(None, cfg["num_battles"])
    elif cfg["mode"] == "challenge":
        opponent = cfg.get("last_opponent", "")
        print(f"[Bot] Challenging {opponent}...\n")
        await bot.send_challenges(opponent, cfg["num_battles"])
    elif cfg["mode"] == "ladder":
        print("[Bot] Seeking a ladder match...\n")
        await bot.ladder(cfg["num_battles"])

if __name__ == "__main__":
    asyncio.run(main())