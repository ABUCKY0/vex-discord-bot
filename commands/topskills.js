const Discord = require('discord.js');

const app = require('../app');
const dbinfo = require('../dbinfo');
const vex = require('../vex');

const db = app.db;

const rankEmojis = ['🥇', '🥈', '🥉'];
const defaultEmoji = '🏅';

module.exports = (message, args) => {
	const seasonName = 'In_The_Zone';
	let grade = args ? args.toUpperCase() : 'HS';
	let program;
	let season;
	let limit;
	if (grade == 'HS') {
		program = 'VRC';
		grade = 'High School';
		season = 119;
		limit = 35;
	} else if (grade == 'MS') {
		program = 'VRC';
		grade = 'Middle School';
		season = 119;
		limit = 15;
	} else if (grade == 'C' || grade == 'U') {
		program = 'VEXU';
		grade = 'College';
		season = 120;
		limit = 5;
	} else {
		message.reply('please enter a valid grade.');
		return;
	}
	db.collection('maxSkills')
		.find({'_id.season': season, 'team.grade': grade})
		.sort({score: -1})
		.limit(limit).toArray().then(teams => {
		if (teams.length) {
			description = '';
			for (let i = 0; i < teams.length; i++) {
				const rank = (i < 3) ? `${rankEmojis[i]} \`:` : `\`#${String(i + 1).padEnd(2)} :`;
				const score = String(teams[i].scores.score).padStart(3);
				const team = teams[i].team.id;
				description += `${rank} ${score}\`   [${team}](https://vexdb.io/teams/view/${team}?t=skills)\n`;
			}
			const embed = new Discord.RichEmbed()
				.setColor('AQUA')
				.setTitle(`${program} ${grade} In the Zone Robot Skills`)
				.setURL(`https://vexdb.io/skills/${program}/${seasonName}/Robot`)
				.setDescription(description);
			message.channel.send({embed})
				.then(reply => app.addFooter(message, embed, reply))
				.catch(console.error);
		} else {
			message.reply(`no skills scores available for ${program} ${grade} In the Zone.`);
		}
	}).catch(console.error);
};
