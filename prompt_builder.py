import sys
from typing import Dict, List, Any
from poke_env.environment.battle import Battle
from poke_env.environment.pokemon import Pokemon
from poke_env.environment.move import Move
from poke_env.environment.effect import Effect

def hp_str(mon: Pokemon) -> str:
    if not mon:
        return "Fainted"
    pct = round(mon.current_hp / mon.max_hp * 100) if mon.max_hp > 0 else 0
    return f"{pct}% ({mon.current_hp}/{mon.max_hp})"

def boosts_str(mon: Pokemon) -> str:
    if not mon or not mon.boosts:
        return ""
    active = {k: v for k, v in mon.boosts.items() if v != 0}
    if not active:
        return ""
    return ", ".join(f"{k}: {v:+}" for k, v in active.items())

def status_str(mon: Pokemon) -> str:
    if not mon:
        return ""
    parts = []
    if mon.status:
        parts.append(mon.status.name)
    if mon.is_terastallized:
        parts.append(f"Tera-{mon.tera_type.name}")
    return " | ".join(parts) if parts else "Healthy"

def weather_terrain_str(battle: Battle) -> str:
    states = []
    if battle.weather:
        weather_name = next(iter(battle.weather.keys())).name if isinstance(battle.weather, dict) else str(battle.weather)
        states.append(f"Weather: {weather_name}")
    if battle.fields:
        for f in battle.fields:
            states.append(f.name)
    return ", ".join(states) if states else "Clear/Normal"

def hazards_str(side_hazards) -> str:
    if not side_hazards:
        return "None"
    items = []
    for hazard, count in side_hazards.items():
        if count > 0:
            name = hazard.name if hasattr(hazard, "name") else str(hazard)
            items.append(f"{name} (x{count})" if count > 1 else name)
    return ", ".join(items) if items else "None"

def screens_str(side_effects) -> str:
    if not side_effects:
        return "None"
    active = []
    for effect in side_effects:
        if effect in [Effect.REFLECT, Effect.LIGHT_SCREEN, Effect.AURORA_VEIL]:
            active.append(effect.name)
    return ", ".join(active) if active else "None"

def opp_team_summary(opp_team: Dict[str, Pokemon]) -> str:
    if not opp_team:
        return "  No info yet"
    lines = []
    for name, mon in opp_team.items():
        boosts = f" [{boosts_str(mon)}]" if boosts_str(mon) else ""
        lines.append(f"  - {mon.species} | HP: {hp_str(mon)} | Status: {status_str(mon)}{boosts}")
    return "\n".join(lines)

def team_summary(team: Dict[str, Pokemon]) -> str:
    if not team:
        return "  (none)"
    lines = []
    for name, mon in team.items():
        boosts = f" [{boosts_str(mon)}]" if boosts_str(mon) else ""
        lines.append(f"  - {mon.species} | HP: {hp_str(mon)} | Status: {status_str(mon)}{boosts}")
    return "\n".join(lines)

def format_move(move: Move) -> str:
    return f"  - {move.id} ({move.type.name}, base power: {move.base_power or 0}, pp: {move.current_pp}/{move.max_pp})"

def format_target(target_value: int) -> str:
    if target_value == 0:
        return "Self/All/Field"
    elif target_value == -1:
        return "Ally Slot 1"
    elif target_value == -2:
        return "Ally Slot 2"
    elif target_value == 1:
        return "Opponent Slot 1"
    elif target_value == 2:
        return "Opponent Slot 2"
    return f"Unknown ({target_value})"

def format_order_for_display(order, battle: Battle) -> str:
    from poke_env.player.battle_order import BattleOrder, DoubleBattleOrder
    if order is None:
        return "PASS (Do nothing)"
    if isinstance(order, BattleOrder):
        if order.move:
            tera_part = " [TERASTALLIZED]" if order.terastallize else ""
            target_part = f" target {format_target(order.target)}" if order.target else ""
            return f"MOVE: {order.move.id}{tera_part}{target_part}"
        elif order.pokemon:
            return f"SWITCH: {order.pokemon.species}"
    elif isinstance(order, DoubleBattleOrder):
        part1 = format_order_for_display(order.first_order, battle)
        part2 = format_order_for_display(order.second_order, battle)
        return f"Slot 1 -> {part1} | Slot 2 -> {part2}"
    return str(order)

def format_switches(switches: List[Pokemon]) -> str:
    if not switches:
        return "  (none)"
    return "\n".join(f"  - {mon.species} (HP: {hp_str(mon)}, Status: {status_str(mon)})" for mon in switches)

def build_llm_prompt(battle: Battle) -> str:
    mon = battle.active_pokemon
    opp = battle.opponent_active_pokemon

    # 1. My Active Pokémon Info
    if mon:
        mon_block = f"""
[SPECIES]: {mon.species}
[HP]: {hp_str(mon)}
[STATUS]: {status_str(mon)}
[BOOSTS]: {boosts_str(mon) or "None"}
[TYPE]: {', '.join(t.name for t in mon.types)}
[STATS]: {mon.stats or "Unknown"}
""".strip()
    else:
        mon_block = "[NONE]"

    # 2. Opponent Active Pokémon Info
    if opp:
        opp_block = f"""
[SPECIES]: {opp.species}
[HP]: {hp_str(opp)}
[STATUS]: {status_str(opp)}
[BOOSTS]: {boosts_str(opp) or "None"}
[TYPE]: {', '.join(t.name for t in opp.types)}
""".strip()
    else:
        opp_block = "[NONE]"

    # 3. Available moves for my active Pokémon
    my_moves = "  (none)"
    if battle.available_moves:
        my_moves = "\n".join(format_move(m) for m in battle.available_moves)

    # 4. Revealed moves of the opponent
    opp_moves = "  (none)"
    if opp and opp.moves:
        opp_moves = "\n".join(format_move(m) for m in opp.moves.values())

    # 5. Field conditions
    weather_terrain = weather_terrain_str(battle)
    hazards_mine = hazards_str(battle.side_conditions)
    hazards_opp = hazards_str(battle.opponent_side_conditions)
    screens = screens_str(battle.side_conditions)

    # 6. Available switches
    switches = format_switches(battle.available_switches)

    # 7. Tera state
    tera_str = "Available (not yet used)" if battle.can_tera else "No / Already Used"

    return f"""
Detailed battle state description:

━━━━━━━━━━━━━━━━━━━━━ MY ACTIVE POKÉMON ━━━━━━━━━━━━━━━━━━━━━
{mon_block}
[TERASTALLIZE_AVAILABLE]: {tera_str}

[AVAILABLE MOVES]:
{my_moves}

━━━━━━━━━━━━━━━━━━ OPPONENT ACTIVE POKÉMON ━━━━━━━━━━━━━━━━━━
{opp_block}

[OPP_REVEALED_MOVES]:
{opp_moves}

━━━━━━━━━━━━━━━━━━━━━━━━━━━ TEAMS ━━━━━━━━━━━━━━━━━━━━━━━━━━━
[MY_TEAM]:
{team_summary(battle.team)}

[OPP_TEAM]:
{opp_team_summary(battle.opponent_team)}

━━━━━━━━━━━━━━━━━━━━━━━━━ FIELD STATE ━━━━━━━━━━━━━━━━━━━━━━━
[WEATHER_TERRAIN]: {weather_terrain}
[HAZARDS_MINE]:    {hazards_mine}
[HAZARDS_OPP]:     {hazards_opp}
[SCREENS]:         {screens}

━━━━━━━━━━━━━━━━━━━━━ AVAILABLE SWITCHES ━━━━━━━━━━━━━━━━━━━━━
{switches}
""".strip()

def build_doubles_llm_prompt(battle: Battle) -> str:
    # Double battles helper
    active_my = battle.active_pokemon
    active_opp = battle.opponent_active_pokemon

    # My actives
    mon1 = active_my[0] if len(active_my) > 0 else None
    mon2 = active_my[1] if len(active_my) > 1 else None

    # Opponent actives
    opp1 = active_opp[0] if len(active_opp) > 0 else None
    opp2 = active_opp[1] if len(active_opp) > 1 else None

    def mon_block_func(mon):
        if not mon:
            return "  [NONE / EMPTY SLOT]"
        return f"""
  Species: {mon.species}
  HP: {hp_str(mon)}
  Status: {status_str(mon)}
  Boosts: {boosts_str(mon) or "None"}
  Types: {', '.join(t.name for t in mon.types)}
        """.strip()

    mon1_block = mon_block_func(mon1)
    mon2_block = mon_block_func(mon2)
    opp1_block = mon_block_func(opp1)
    opp2_block = mon_block_func(opp2)

    # Moves
    my_moves_1 = "  (none)"
    if len(battle.available_moves) > 0 and battle.available_moves[0]:
        my_moves_1 = "\n".join(format_move(m) for m in battle.available_moves[0])
    my_moves_2 = "  (none)"
    if len(battle.available_moves) > 1 and battle.available_moves[1]:
        my_moves_2 = "\n".join(format_move(m) for m in battle.available_moves[1])

    opp_moves_1 = "  (none)"
    if opp1 and opp1.moves:
        opp_moves_1 = "\n".join(format_move(m) for m in opp1.moves.values())
    opp_moves_2 = "  (none)"
    if opp2 and opp2.moves:
        opp_moves_2 = "\n".join(format_move(m) for m in opp2.moves.values())

    # Field/hazards
    weather_terrain = weather_terrain_str(battle)
    hazards_mine = hazards_str(battle.side_conditions)
    hazards_opp = hazards_str(battle.opponent_side_conditions)
    screens = screens_str(battle.side_conditions)

    # Switches
    switches_1 = format_switches(battle.available_switches[0]) if len(battle.available_switches) > 0 else "  (none)"
    switches_2 = format_switches(battle.available_switches[1]) if len(battle.available_switches) > 1 else "  (none)"

    # Tera details
    tera1_str = "Available (not yet used)" if (len(battle.can_tera) > 0 and battle.can_tera[0]) else "No / Already Used"
    tera2_str = "Available (not yet used)" if (len(battle.can_tera) > 1 and battle.can_tera[1]) else "No / Already Used"

    return f"""
╔══════════════════════════════════════════════════════════════════╗
║      GRANDMASTER POKÉMON DOUBLES BATTLE STATE — TURN {battle.turn:>3}      ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━ MY ACTIVE SLOT 1 ━━━━━━━━━━━━━━━━━━━━━
{mon1_block}
[TERA_AVAILABLE]: {tera1_str}

[AVAILABLE MOVES SLOT 1]:
{my_moves_1}

━━━━━━━━━━━━━━━━━━━━━ MY ACTIVE SLOT 2 ━━━━━━━━━━━━━━━━━━━━━
{mon2_block}
[TERA_AVAILABLE]: {tera2_str}

[AVAILABLE MOVES SLOT 2]:
{my_moves_2}

━━━━━━━━━━━━━━━━━━ OPPONENT ACTIVE SLOT 1 ━━━━━━━━━━━━━━━━━━
{opp1_block}

[OPP_REVEALED_MOVES SLOT 1]:
{opp_moves_1}

━━━━━━━━━━━━━━━━━━ OPPONENT ACTIVE SLOT 2 ━━━━━━━━━━━━━━━━━━
{opp2_block}

[OPP_REVEALED_MOVES SLOT 2]:
{opp_moves_2}

━━━━━━━━━━━━━━━━━━━━━━━ TEAMS ━━━━━━━━━━━━━━━━━━━━━━━━
[MY_TEAM]:
{team_summary(battle.team)}

[OPP_TEAM]:
{opp_team_summary(battle.opponent_team)}

━━━━━━━━━━━━━━━━━━━━━ FIELD STATE ━━━━━━━━━━━━━━━━━━━━
[WEATHER_TERRAIN]: {weather_terrain}
[HAZARDS_MINE]:    {hazards_mine}
[HAZARDS_OPP]:     {hazards_opp}
[SCREENS]:         {screens}

━━━━━━━━━━━━━━━━━━ AVAILABLE SWITCHES ━━━━━━━━━━━━━━━━━━
[SLOT 1 SWITCHES]:
{switches_1}

[SLOT 2 SWITCHES]:
{switches_2}

━━━━━━━━━━━━━━━━━━ DOUBLES TARGETS KEY ━━━━━━━━━━━━━━━━━━
When outputting targets for slot-specific actions:
- Ally Slot 1 (first slot): target value is -1
- Ally Slot 2 (second slot): target value is -2
- Opponent Slot 1: target value is 1
- Opponent Slot 2: target value is 2
- Self / All / Field: target value is 0
""".strip()
