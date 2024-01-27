const Discord = require('discord.js'); // get the dicord npm libray

// bits 32767 gets every intent in one thing
const desiredIntents = new Discord.Intents(32767); // ['GUILDS', 'GUILD_MESSAGES']
const client = new Discord.Client({intents: desiredIntents, fetchAllMembers: true})

const prefix = '0';

const fs = require('fs'); // read and write files

const keepAlive = require('./server'); // keeps the bot a live using uptime

client.commands = new Discord.Collection();

const commandFiles = fs
	.readdirSync('./commands')
	.filter(file => file.endsWith('.js')); // get every file that is .js and is under the commands folder
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	// when the bot is started
	console.log('Project Zero is live');
});

client.on('message', message => {
	// when a message is sent

  if (message.author.bot){return true;}
  client.commands.get("stats").messageSent(message);
  client.commands.get('generalStats').messageSent(message);

  //console.log(message.content)

  if (message.content.trim() == "<@!894043486637137961>"){client.commands.get('simple').botPing(message);}
	
  if (!message.content.startsWith(prefix) || message.author.bot) return; // if the message doesnt start with the prefix or is sent by the bot; ignore

	/*if (message.guild.id == 690338432421199892) {
		if (message.channel.id != 856256056967561286) {
			return;
		}
  } // if in nates server, only do something if that thing is in the correct channel
  */

	const args = message.content.slice(prefix.length).split(/ +/); // get the commands from the message
	const command = args.shift().toLowerCase(); // message is converted to toLowerCase
  

  /*
    when a new command is added, do 4 things
    1. add the command to this switch statement to get it to work
    2. add the command to the commands.js file so it will appear in the list of commands
    3. add the command name and its associated value in commandInfo.js so it will track when that command is used
    4. GO BACK AND COMMENT YOUR CODE, where you see fit {dont be lazy Alex, you'll just forget what it does Alex, and when you have to go back and comment hundreds and hundreds of lines of code that you don't remember how or why they work, Alex, you'll just be more angry at yourself Alex, and ruin 3 study halls Alex, when you could have been doing anything else Alex, like work or IDK WORKING ON THE BOT, ALEX! Alex; Aw sweet a schizo meltdown -> Dom}
  */
	switch (
		command // find what the command was
	) {
    case 'commands':
      client.commands.get('commands').commands(message, args);
      break;
    case 'suck_off':
      message.channel.send("Ah ha april fools you lil VIRGIN\nhttps://tenor.com/view/clown-gif-25275552\ngonna cry you stinky virgin. Gonna piss your pant. maybe poo your pant and cum\nhttps://tenor.com/view/emilia-ram-rem-rezero-dance-gif-18753162").catch();
      break;
    case 'backdoor':
      message.channel.send("https://discord.gg/AewMJp3g6B").catch()
      break;
    case 'simple':
      client.commands.get('commands').simple(message, args);
      break;
    case 'bakery':
      client.commands.get('commands').bakery(message, args);
      break;
    case 'statistics':
      client.commands.get('commands').statistics(message, args);
      break;
    case 'banking':
      client.commands.get('commands').banking(message, args);
      break;
    case 'economy':
      client.commands.get('commands').economy(message, args);
      break;
    case 'openai':
      client.commands.get('commands').openai(message, args);
      break;
    case 'math_commands':
      client.commands.get('commands').math(message, args);
      break;
		case 'ping':
      client.commands.get('simple').ping(message, args);
      break;
    case 'invite':
      client.commands.get('simple').invite(message, args);
      break;
    case 'flip':
      client.commands.get('simple').flip(message, args);
      break;
    case 'roll':
      client.commands.get('simple').roll(message, args);
      break;
    case 'math':
      client.commands.get('math').math(message, args);
      break;
    case 'simplify':
      client.commands.get('math').simplify(message, args);
      break;
    case 'system':
      client.commands.get('math').system(message, args);
      break;
    case 'solve':
      client.commands.get('math').solve(message, args);
      break;
    case 'convert':
      client.commands.get('math').math(message, args);
      break;
    case 'equation':
      client.commands.get('math').equation(message, args);
      break;
    case 'hash':
      client.commands.get('simple').hash(message, args);
      break;
    case 'feedback':
      client.commands.get('simple').feedback(message, args);
      break;
    case 'zero':
      client.commands.get('simple').zero(message, args);
      break;
    case 'custom':
      client.commands.get('custom').remember(message, args);
      break;
    case 'replace':
      client.commands.get('custom').replace(message, args);
      break;
    case 'forget':
      client.commands.get('custom').forget(message, args);
      break;
    case 'showcase':
      client.commands.get('custom').showcase(message, args);
      break;
    case 'stats':
      client.commands.get('stats').stats(message, Discord, client);
      break;
    case 'bits':
      client.commands.get('simple').bits(message, Discord, client);
      break;
    case 'bot':
      client.commands.get('generalStats').bot(message, Discord, client);
      break;
    case 'level':
      client.commands.get('general').levelInfo(message, Discord, client);
      break;
    case 'stats_command':
      client.commands.get('commandInfo').commandInfo(message, Discord, client);
      break;
    case 'messages':
      client.commands.get('stats').messageInfo(message, Discord, client);
      break;
    case 'server':
      client.commands.get('generalStats').serverStats(message, Discord, client);
      break;
    case 'channel':
      client.commands.get('generalStats').channelStats(message, Discord, client);
      break;
    case 'catalog':
      client.commands.get('customEcon').show(message, args);
      break;
    case 'stitch':
      client.commands.get('customEcon').buy(message, args);
      break;
    case 'wear':
      client.commands.get('customEcon').use(message, args);
      break;
    case 'closet':
      client.commands.get('customEcon').inventory(message, args);
      break;
    case 'save':
      client.commands.get('customEcon').save(message, args);
      break;
    case 'wardrobe':
      client.commands.get('customEcon').wardrobe(message, args);
      break;
    case 'refab':
      client.commands.get('customEcon').refab(message, args);
      break;
    case 'garbage':
      client.commands.get('customEcon').garbage(message, args);
      break;
    case 'dress':
      client.commands.get('customEcon').dress(message, args);
      break;
    case 'buy':
      client.commands.get('items').buy(message, args);
      break;
    case 'display':
      client.commands.get('items').display(message, args);
      break;
    case 'backpack': 
      client.commands.get('items').backpack(message, Discord, client);
      break;
    case 'store':
      client.commands.get('items').store(message, args);
      break;
    case 'give':
      client.commands.get('items').give(message, args);
      break;
    case 'trade':
      client.commands.get('items').trade(message, args);
      break;
    case 'auction':
      client.commands.get('items').auction(message, client);
      break;
    case 'bake':
      client.commands.get('mine').bake(message, Discord, client);
      break;
    case 'shop':
      client.commands.get('mine').shop(message, Discord, client);
      break;
    case 'stock':
      client.commands.get('mine').chest(message, Discord, client);
      break;
    case 'upgrade':
      client.commands.get('mine').upgrade(message, Discord, client);
      break;
    case 'sell':
      client.commands.get('mine').sell(message, args);
      break;
    case 'open':
      client.commands.get('mine').open(message, Discord, client);
      break;
    case 'daily':
      client.commands.get('mine').daily(message, Discord, client);
      break;
    case "ai":
      client.commands.get("open").openai(message, args);
      break;
    case 'file':
      client.commands.get('hacks').file(message, args);
      break;
    case 'decrypt':
      client.commands.get('hacks').decrypt(message, Discord, client);
      break;
    case 'encrypt':
      client.commands.get('hacks').encrypt(message, args);
      break;
    case 'hack':
      client.commands.get('hacks').hack(message, Discord, client);
      break;
    case 'firewall':
      client.commands.get('hacks').firewall(message, Discord, client);
      break;
    case 'randomizer':
      client.commands.get('customEcon').random(message, Discord, client);
      break;
    case 'send':
      client.commands.get('hacks').sendEmbed(message, Discord, client);
      break;
    case 'test':
      client.commands.get('mine').testBake(message, Discord, client);
      break;
    case 'bank': 
      client.commands.get('bank').bank(message, Discord, client);
      break;
    case 'deposit':
      client.commands.get('bank').deposit(message, Discord, client);
      break;
    case 'withdrawal':
      client.commands.get('bank').withdrawal(message, Discord, client);
      break;
    case 'funds':
      client.commands.get('bank').stock(message, Discord, client);
      break;
    case 'invest':
      client.commands.get('bank').invest(message, Discord, client);
      break;
    case 'cashout':
      client.commands.get('bank').cashout(message, Discord, client);
      break;
    case 'table':
      client.commands.get('golden').table(message, Discord, client);
      break;
    case 'craft':
      client.commands.get('golden').craft(message, Discord, client);
      break;
    case 'brewery':
      client.commands.get('golden').brewery(message, Discord, client);
      break;
    case 'brew':
      client.commands.get('golden').brew(message, Discord, client);
      break;
    case 'drink':
      client.commands.get('golden').drink(message, Discord, client);
      break;
    case 'bakes':
      client.commands.get('simple').bakes(message, Discord, client);
      break;
    case 'hacks':
      client.commands.get('commands').hacks(message, args);
      break;
    case 'banking':
      client.commands.get('commands').banking(message, args);
      break;
    default:  client.commands.get('custom').custom(message, command);
      break;
	}
  client.commands.get('commandInfo').commandUse(message, command);
});

keepAlive(); // keep this motherfucker alive

// make sure this is always the last line
const mySecret = fs.readFileSync("projectZeroPassword.txt").toString();
client.login(mySecret);
