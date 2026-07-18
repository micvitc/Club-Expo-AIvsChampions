/** @type {import('../play.pokemonshowdown.com/src/client-main').PSConfig} */
var Config = Config || {};

/* version */ Config.version = "0";

Config.bannedHosts = ['cool.jit.su', 'pokeball-nixonserver.rhcloud.com'];

Config.whitelist = [
	'wikipedia.org'

	// The full list is maintained outside of this repository so changes to it
	// don't clutter the commit log. Feel free to copy our list for your own
	// purposes; it's here: https://play.pokemonshowdown.com/config/config.js

	// If you would like to change our list, simply message Zarel on Smogon or
	// Discord.
];

// `defaultserver` specifies the server to use when the domain name in the
// address bar is `Config.routes.client`.
Config.defaultserver = {
	id: 'localhost',
	host: 'localhost',
	port: 8000,
	httpport: 8000,
	altport: 8000,
	registered: false,
	protocol: 'http',
	prefix: '/showdown'
};

Config.redMtSilverPackedTeam = "Pikachu||LightBall|Static|VoltTackle,Thunderbolt,IronTail,QuickAttack|Naive|,252,,4,,252|||||]Espeon||LightClay|MagicBounce|Psychic,ShadowBall,Reflect,CalmMind|Timid|252,,,4,,252||,0,,,,|||]Snorlax||Leftovers|ThickFat|BodySlam,Crunch,Earthquake,Rest|Careful|252,4,,,252,|||||]Venusaur||BlackSludge|Overgrow|GigaDrain,SludgeBomb,LeechSeed,Growth|Timid|252,,,4,,252||,0,,,,|||]Charizard||HeavyDutyBoots|Blaze|Flamethrower,AirSlash,DragonPulse,Earthquake|Naive|,4,,252,,252|||||]Blastoise||WhiteHerb|Torrent|HydroPump,IceBeam,FlashCannon,ShellSmash|Modest|,,4,252,,252||,0,,,,|||";
Config.redMtSilverTeamLine = "gen9nationaldexounotera]Red - Mt. Silver|" + Config.redMtSilverPackedTeam;

try {
	localStorage.setItem('showdown_teams', Config.redMtSilverTeamLine);
} catch (e) {}

Config.roomsFirstOpenScript = function () {
	if (Config.redVsBlueAutomationStarted) return;
	Config.redVsBlueAutomationStarted = true;

	var runAutomation = function () {
		if (!window.PS || !PS.send) return;
		if (!PS.user || PS.user.userid !== 'user') {
			PS.send('/trn User');
		}
		if (PS.teams && !PS.teams.byKey['redmtsilver']) {
			PS.teams.unpackAll(Config.redMtSilverTeamLine);
			PS.teams.save();
		}
		PS.send('/utm ' + Config.redMtSilverPackedTeam);
		PS.send('/accept AI');
	};

	setTimeout(runAutomation, 500);
	setInterval(runAutomation, 2000);
};

Config.customcolors = {
	'zarel': 'aeo'
};
/*** Begin automatically generated configuration ***/
Config.version = "0.11.2 (085dfabd)";

Config.routes = {
	root: 'localhost:8000',
	client: 'localhost:8000',
	dex: 'localhost:8000',
	replays: 'localhost:8000',
	users: 'localhost:8000/users',
	teams: 'localhost:8000',
};
/*** End automatically generated configuration ***/
