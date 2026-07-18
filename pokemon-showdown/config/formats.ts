// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: import('../sim/dex-formats').FormatList = [
	{
		section: "Gen 9 OU (No Terastal)",
	},
	{
		name: "[Gen 9] OU (No Tera)",
		threads: [
			`&bullet; <a href="https://www.smogon.com/forums/threads/3710957/">OU Metagame Discussion</a>`,
		],
		mod: 'gen9',
		ruleset: ['Standard', 'Sleep Moves Clause', 'Terastal Clause'],
		banlist: ['AG', 'Uber', 'Moody', 'Baton Pass', 'Last Respects', 'Shed Tail'],
	},
	{
		name: "[Gen 9] National Dex OU (No Tera)",
		mod: 'gen9',
		ruleset: ['Standard NatDex', 'Terastal Clause'],
		banlist: ['ND AG', 'ND Uber', 'Moody', 'Baton Pass', 'Last Respects', 'Shed Tail'],
	}
];
