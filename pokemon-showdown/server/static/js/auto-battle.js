(function () {
  var PACKED_TEAM =
    "Pikachu|Pikachu|Light Ball|Static|Volt Tackle,Thunderbolt,Iron Tail,Quick Attack|Naive|0,252,0,4,0,252||31,31,31,31,31,31||100|]" +
    "Espeon|Espeon|Light Clay|Magic Bounce|Psychic,Shadow Ball,Reflect,Calm Mind|Timid|252,0,0,4,0,252||31,31,31,31,31,31||100|]" +
    "Snorlax|Snorlax|Leftovers|Thick Fat|Body Slam,Crunch,Earthquake,Rest|Careful|252,4,0,0,252,0||31,31,31,31,31,31||100|]" +
    "Venusaur|Venusaur|Black Sludge|Overgrow|Giga Drain,Sludge Bomb,Leech Seed,Growth|Timid|252,0,0,4,0,252||31,31,31,31,31,31||100|]" +
    "Charizard|Charizard|Heavy-Duty Boots|Blaze|Flamethrower,Air Slash,Dragon Pulse,Earthquake|Naive|0,4,0,252,0,252||31,31,31,31,31,31||100|]" +
    "Blastoise|Blastoise|White Herb|Torrent|Scald,Ice Beam,Aura Sphere,Rain Dance|Modest|0,0,4,252,0,252||31,31,31,31,31,31||100|";

  var ACCEPTED_KEY = "__auto_accepted";
  var CHALLENGED_AI_KEY = "__challenged_ai";
  var LOG_PREFIX = "[AutoBattle]";

  function log(msg) {
    console.log(LOG_PREFIX, msg);
  }

  function send(cmd) {
    if (PS && PS.connection && PS.connection.connected) {
      PS.send(cmd);
      log("Sent: " + cmd);
    }
  }

  function autoLogin() {
    if (PS.user.named) { log("Already named: " + PS.user.name); return; }
    if (PS.user.loggingIn) { log("Already logging in..."); return; }
    var userid = toID("User");
    if (userid === PS.user.userid) { log("Already User"); return; }
    log("Logging in as User...");
    PS.user.changeName("User");
  }

  function setTeam() {
    if (PS.mainmenu && PS.mainmenu.teamSent) { log("Team already sent"); return; }
    log("Setting team...");
    send("/utm " + PACKED_TEAM);
  }

  function autoAcceptChallenge() {
    var roomCount = 0;
    for (var roomId in PS.rooms) {
      roomCount++;
      var room = PS.rooms[roomId];
      var hasChallenge = !!room.challenged;
      var pmTarget = room.pmTarget;
      var pmTargetId = pmTarget ? toID(pmTarget) : null;
      var alreadyAccepted = room[ACCEPTED_KEY];

      if (hasChallenge && pmTargetId === "ai") {
        if (alreadyAccepted) {
          log("Room " + roomId + ": challenge already accepted, skipping");
          continue;
        }
        log("Room " + roomId + ": FOUND challenge from AI! challenged=" + JSON.stringify(room.challenged));
        room[ACCEPTED_KEY] = true;
        setTeam();
        log("Accepting challenge from AI...");
        send("/accept ai");
      }
    }
  }

  function challengeAIDirectly() {
    if (PS[CHALLENGED_AI_KEY]) return;
    PS[CHALLENGED_AI_KEY] = true;
    log("No challenge received yet; challenging AI directly...");
    setTeam();
    send("/challenge AI, gen9nationaldexounotera");
  }

  function start() {
    if (!PS || !PS.connection || !PS.mainmenu) {
      setTimeout(start, 200);
      return;
    }
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      log("Not localhost, skipping.");
      return;
    }

    log("Starting auto-battle...");

    var ready = setInterval(function () {
      if (PS.connection.connected) {
        clearInterval(ready);
        log("Connected.");
        autoLogin();

        var checkLogin = setInterval(function () {
          if (PS.user.named) {
            clearInterval(checkLogin);
            log("Logged in as " + PS.user.name);
            setTeam();

            var challengeSince = Date.now();
            setInterval(function () {
              autoAcceptChallenge();

              if (Date.now() - challengeSince > 10000) {
                challengeAIDirectly();
              }
            }, 500);
          }
        }, 300);
      }
    }, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
