import asyncio
import os
import sys

from poke_env.ps_client.account_configuration import AccountConfiguration
from poke_env.teambuilder.constant_teambuilder import ConstantTeambuilder
from poke_env import LocalhostServerConfiguration, ShowdownServerConfiguration

from config_manager import C, startup_wizard
from assistant_player import PokémonAssistant

async def main():
    cfg = startup_wizard()

    team_str  = cfg["_team"]
    opponent  = cfg["_opponent"]
    username  = cfg["username"]
    password  = cfg["password"] or None
    fmt       = cfg["format"]
    num       = cfg["num_battles"]
    mode      = cfg["mode"]
    server    = cfg["server"]

    server_cfg = (
        LocalhostServerConfiguration if server == "localhost"
        else ShowdownServerConfiguration
    )

    teambuilder = ConstantTeambuilder(team_str)

    bot = PokémonAssistant(
        account_configuration=AccountConfiguration(username, password),
        battle_format=fmt,
        team=teambuilder,
        server_configuration=server_cfg,
        gemini_api_key=cfg.get("gemini_api_key"),
    )

    print(f"\n{C.GREEN}{C.BOLD}🤖  Bot '{username}' is online.{C.RESET}")
    print(f"📦  Team loaded.")
    print(f"🎮  Format: {fmt}")

    if mode == "accept":
        print("⏳  Waiting for an incoming challenge…\n")
        await bot.accept_challenges(None, num)

    elif mode == "challenge":
        print(f"⚔️   Challenging {C.YELLOW}{opponent}{C.RESET}…\n")
        await bot.send_challenges(opponent, num)

    elif mode == "ladder":
        print("🔍  Seeking a ladder match…\n")
        await bot.ladder(num)

if __name__ == "__main__":
    asyncio.run(main())