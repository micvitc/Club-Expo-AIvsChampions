import asyncio
import os
import shutil
import subprocess
from typing import Optional, Any

from poke_env.player import Player
from poke_env.player.battle_order import DoubleBattleOrder, SingleBattleOrder, PassBattleOrder, DefaultBattleOrder
from poke_env.battle.battle import Battle
from poke_env.battle.double_battle import DoubleBattle
from poke_env.ps_client.account_configuration import AccountConfiguration
from poke_env.teambuilder.constant_teambuilder import ConstantTeambuilder

from config_manager import C
from prompt_builder import (
    build_llm_prompt,
    build_doubles_llm_prompt,
    opp_team_summary,
    format_order_for_display,
)
from llm_client import GeminiClient, SingleBattleDecision, DoublesBattleDecision

def copy_to_clipboard(text: str) -> bool:
    data = text.encode()
    candidates = [
        (["wl-copy"],                          {}),
        (["xclip", "-selection", "clipboard"], {}),
        (["xsel",  "--clipboard", "--input"],  {}),
        (["pbcopy"],                           {}),
    ]
    for cmd, _ in candidates:
        if shutil.which(cmd[0]):
            try:
                subprocess.run(cmd, input=data, check=True, timeout=3)
                return True
            except Exception:
                pass
    return False

class PokémonAssistant(Player):
    def __init__(self, *args, gemini_api_key: Optional[str] = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.gemini_client = GeminiClient(api_key=gemini_api_key)

    # ── TEAM PREVIEW ──────────────────────────────────────────────────────────
    async def teampreview(self, battle) -> str:
        print("\n" + "═" * 70)
        print("🔍  STRATEGY PHASE: TEAM PREVIEW")
        print(f"\nOpponent's revealed team:\n{opp_team_summary(battle.opponent_team)}")
        print("═" * 70)

        team_list = list(battle.team.values())
        print("\n📋  YOUR TEAM:")
        for i, mon in enumerate(team_list, 1):
            print(f"  [{i}] {mon.species}")

        is_doubles = isinstance(battle, DoubleBattle)
        if is_doubles:
            print("\n[DECISION] Choose Lead 1 and Lead 2 (Enter number 1–6)")
            lead_idx_1 = -1
            lead_idx_2 = -1
            while True:
                try:
                    choice1 = await asyncio.to_thread(input, "Lead 1 > ")
                    idx1 = int(choice1.strip()) - 1
                    if 0 <= idx1 < len(team_list):
                        lead_idx_1 = idx1
                        break
                    print(f"❌  Pick a number between 1 and {len(team_list)}")
                except (ValueError, EOFError):
                    print("❌  Invalid input. Please enter a number.")
            while True:
                try:
                    choice2 = await asyncio.to_thread(input, "Lead 2 > ")
                    idx2 = int(choice2.strip()) - 1
                    if 0 <= idx2 < len(team_list) and idx2 != lead_idx_1:
                        lead_idx_2 = idx2
                        break
                    if idx2 == lead_idx_1:
                        print("❌  Lead 2 cannot be the same as Lead 1.")
                    else:
                        print(f"❌  Pick a number between 1 and {len(team_list)}")
                except (ValueError, EOFError):
                    print("❌  Invalid input. Please enter a number.")
            
            order = list(range(1, len(team_list) + 1))
            val1 = lead_idx_1 + 1
            val2 = lead_idx_2 + 1
            order.remove(val1)
            order.remove(val2)
            order.insert(0, val2)
            order.insert(0, val1)
            return "/team " + "".join(map(str, order))
        else:
            print("\n[DECISION] Who should LEAD? (Enter number 1–6)")
            while True:
                try:
                    choice = await asyncio.to_thread(input, "Lead > ")
                    idx = int(choice.strip()) - 1
                    if 0 <= idx < len(team_list):
                        order = list(range(1, len(team_list) + 1))
                        order.insert(0, order.pop(idx))
                        return "/team " + "".join(map(str, order))
                    print(f"❌  Pick a number between 1 and {len(team_list)}")
                except (ValueError, EOFError):
                    print("❌  Invalid input. Please enter a number.")

    # ── MAIN DECISION LOOP ────────────────────────────────────────────────────
    async def choose_move(self, battle) -> DoubleBattleOrder | SingleBattleOrder | DefaultBattleOrder:
        if isinstance(battle, DoubleBattle):
            return await self.choose_doubles_move(battle)

        me  = battle.active_pokemon
        opp = battle.opponent_active_pokemon

        if not me or not opp:
            return self.choose_random_move(battle)

        prompt       = build_llm_prompt(battle)
        clipboard_ok = copy_to_clipboard(prompt)

        print("\n" + "═" * 70)
        print(prompt)
        print("═" * 70)

        if clipboard_ok:
            print("\n✅  Prompt copied to clipboard — paste into your AI chat (Ctrl+V).")
        else:
            print("\n⚠️   Clipboard unavailable. Copy the prompt above manually.")

        # Construct AVAILABLE ACTIONS list
        actions = []
        for idx, move in enumerate(battle.available_moves):
            actions.append({
                "type": "move",
                "index": idx,
                "description": f"Move: {move.id.upper()}"
            })
        if battle.can_tera:
            for idx, move in enumerate(battle.available_moves):
                actions.append({
                    "type": "tera",
                    "index": idx,
                    "description": f"Tera Move: {move.id.upper()} (Terastallize)"
                })
        for idx, switch in enumerate(battle.available_switches):
            actions.append({
                "type": "switch",
                "index": idx,
                "description": f"Switch to {switch.species} ({switch.current_hp_fraction*100:.0f}% HP)"
            })

        print("\n📋  AVAILABLE ACTIONS:")
        for i, a in enumerate(actions, 1):
            print(f"    [{i}]  →  {a['description']}")

        # Query Gemini if configured
        if self.gemini_client.is_configured():
            actions_str = "AVAILABLE ACTIONS:\n" + "\n".join(
                f"  [{i+1}] {a['description']}" for i, a in enumerate(actions)
            )
            full_prompt = f"{prompt}\n\n{actions_str}\n\nYou MUST select one action index from the AVAILABLE ACTIONS list. Respond with the schema."
            
            decision = await self.gemini_client.get_decision(full_prompt, SingleBattleDecision)
            if decision:
                reason = decision.get("reasoning_summary")
                action_idx = decision.get("action_index", 1) - 1
                
                if 0 <= action_idx < len(actions):
                    chosen_action = actions[action_idx]
                    print(f"\n🤖  {C.GREEN}{C.BOLD}Gemini Decision:{C.RESET} {chosen_action['description']}")
                    print(f"💬  {C.YELLOW}Reasoning:{C.RESET} {reason}")
                    
                    if reason:
                        reason_clean = reason.replace("\n", " ").strip()
                        await self.ps_client.send_message(f"🤖 assistant: {reason_clean}", room=battle.battle_tag)
                    
                    if chosen_action["type"] == "tera":
                        return self.create_order(battle.available_moves[chosen_action["index"]], terastallize=True)
                    elif chosen_action["type"] == "move":
                        return self.create_order(battle.available_moves[chosen_action["index"]])
                    elif chosen_action["type"] == "switch":
                        return self.create_order(battle.available_switches[chosen_action["index"]])
                else:
                    print(f"\n❌  Gemini selected invalid action index: {action_idx + 1}")

        # Fallback to manual selection
        print("\nCommands:  move <n>  |  switch <n>  |  tera [move] <n>  |  c (re-copy prompt)")

        while True:
            try:
                raw = await asyncio.to_thread(input, "\n[DECISION] > ")
            except (EOFError, KeyboardInterrupt):
                print("\nInterrupted — picking random move.")
                return self.choose_random_move(battle)

            tokens = raw.strip().lower().split()
            if not tokens:
                continue

            if tokens[0] == "c":
                if copy_to_clipboard(prompt):
                    print("✅  Prompt copied to clipboard!")
                else:
                    print("⚠️   Clipboard unavailable.")
                continue

            try:
                if tokens[0] == "tera":
                    if not battle.can_tera:
                        print("❌  Terastalization already used or unavailable.")
                        continue
                    idx = int(tokens[-1]) - 1
                    return self.create_order(battle.available_moves[idx], terastallize=True)

                elif tokens[0] == "move" and len(tokens) > 1:
                    idx = int(tokens[1]) - 1
                    return self.create_order(battle.available_moves[idx])

                elif tokens[0] == "switch" and len(tokens) > 1:
                    idx = int(tokens[1]) - 1
                    return self.create_order(battle.available_switches[idx])

                else:
                    print("❌  Unknown command. Use:  move <n>  |  switch <n>  |  tera [move] <n>  |  c")

            except (ValueError, IndexError):
                print(
                    f"❌  Invalid index. "
                    f"Moves: 1–{len(battle.available_moves)}  |  "
                    f"Switches: 1–{len(battle.available_switches)}"
                )

    async def choose_doubles_move(self, battle: DoubleBattle) -> DoubleBattleOrder:
        prompt = build_doubles_llm_prompt(battle)
        clipboard_ok = copy_to_clipboard(prompt)

        print("\n" + "═" * 70)
        print(prompt)
        print("═" * 70)

        if clipboard_ok:
            print("\n✅  Prompt copied to clipboard — paste into your AI chat (Ctrl+V).")
        else:
            print("\n⚠️   Clipboard unavailable. Copy the prompt above manually.")

        valid_orders = battle.valid_orders
        final_orders = [None, None]
        slot_actions = [[], []]

        for slot in range(2):
            active_mon = battle.active_pokemon[slot]
            slot_orders = valid_orders[slot]
            non_pass_orders = [o for o in slot_orders if not isinstance(o, PassBattleOrder)]
            
            for idx, order in enumerate(non_pass_orders):
                desc = format_order_for_display(order, battle)
                slot_actions[slot].append({
                    "index": idx,
                    "description": desc,
                    "order": order
                })

        # Query Gemini if configured
        if self.gemini_client.is_configured():
            actions_str = ""
            for slot in range(2):
                active_mon = battle.active_pokemon[slot]
                mon_name = active_mon.species if active_mon else f"Slot {slot+1}"
                actions_str += f"\nAVAILABLE ACTIONS FOR {mon_name} (Slot {slot+1}):\n"
                if not slot_actions[slot]:
                    actions_str += "  [1] PASS (No action available)\n"
                else:
                    for i, a in enumerate(slot_actions[slot]):
                        actions_str += f"  [{i+1}] {a['description']}\n"
            
            full_prompt = f"{prompt}\n\n{actions_str}\n\nYou MUST select one action index for Slot 1 and one action index for Slot 2 from the lists above. Respond with the schema."
            
            decision = await self.gemini_client.get_decision(full_prompt, DoublesBattleDecision)
            if decision:
                reason = decision.get("reasoning_summary")
                print(f"\n🤖  {C.GREEN}{C.BOLD}Gemini Doubles Decision:{C.RESET}")
                print(f"💬  {C.YELLOW}Reasoning:{C.RESET} {reason}")
                
                if reason:
                    reason_clean = reason.replace("\n", " ").strip()
                    await self.ps_client.send_message(f"🤖 assistant: {reason_clean}", room=battle.battle_tag)
                
                for slot in range(2):
                    active_mon = battle.active_pokemon[slot]
                    if not slot_actions[slot]:
                        final_orders[slot] = PassBattleOrder()
                        continue
                    
                    key = f"slot{slot+1}_action_index"
                    action_idx = decision.get(key, 1) - 1
                    
                    if 0 <= action_idx < len(slot_actions[slot]):
                        chosen = slot_actions[slot][action_idx]
                        print(f"  Slot {slot+1} action: {chosen['description']}")
                        final_orders[slot] = chosen["order"]
                    else:
                        print(f"  Slot {slot+1} action index invalid ({action_idx+1}), using first option.")
                        final_orders[slot] = slot_actions[slot][0]["order"]
                
                return DoubleBattleOrder(first_order=final_orders[0] or PassBattleOrder(), second_order=final_orders[1] or PassBattleOrder())

        # Fallback to manual selection
        for slot in range(2):
            active_mon = battle.active_pokemon[slot]
            non_pass_orders = [a["order"] for a in slot_actions[slot]]

            if not non_pass_orders:
                final_orders[slot] = PassBattleOrder()
                print(f"\nSlot {slot + 1} ({active_mon.species if active_mon else 'Empty'}): PASS (No action available)")
                continue

            print(f"\n📋  AVAILABLE ACTIONS FOR SLOT {slot + 1} ({active_mon.species if active_mon else 'Empty'}):")
            for idx, action in enumerate(slot_actions[slot], 1):
                print(f"    [{idx}]  →  {action['description']}")

            print(f"Commands for Slot {slot + 1}: Enter choice number (1-{len(non_pass_orders)}) | 'c' to copy prompt")

            while True:
                try:
                    raw = await asyncio.to_thread(input, f"[SLOT {slot + 1} DECISION] > ")
                except (EOFError, KeyboardInterrupt):
                    print("\nInterrupted — picking random move.")
                    return self.choose_random_move(battle)

                choice = raw.strip().lower()
                if not choice:
                    continue

                if choice == "c":
                    if copy_to_clipboard(prompt):
                        print("✅  Prompt copied to clipboard!")
                    else:
                        print("⚠️   Clipboard unavailable.")
                    continue

                try:
                    idx = int(choice) - 1
                    if 0 <= idx < len(non_pass_orders):
                        final_orders[slot] = non_pass_orders[idx]
                        break
                    print(f"❌  Pick a number between 1 and {len(non_pass_orders)}")
                except ValueError:
                    print(f"❌  Invalid input. Enter a choice number.")

        return DoubleBattleOrder(first_order=final_orders[0] or PassBattleOrder(), second_order=final_orders[1] or PassBattleOrder())

    async def choose_move_order(self, battle) -> DoubleBattleOrder | SingleBattleOrder | DefaultBattleOrder:
        return await self.choose_move(battle)
