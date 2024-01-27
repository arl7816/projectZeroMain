const general = require("./general");

// dictionary of every command and its type 
const commands = {
  "ping": "Simple",
  "hash": "Simple",
  "custom": "Simple",
  "replace": "Simple",
  "feedback": "Simple",
  "forget": "Simple",
  "showcase": "Simple",
  "roll": "Simple",
  "flip": "Simple",
  "zero": "Simple",
  "invite": "Simple",
  "backdoor": "Simple",
  "stats": "Statistics",
  "stats_command": "Statistics",
  "server": "Statistics",
  "channel": "Statistics",
  "bot": "Statistics",
  "pinged": "Statistics",
  "messages": "Statistics",
  "voice": "Statistics",
  "level": "Statistics",
  "bits": "Statistics",
  "stitch": "Economy",
  "wear": "Economy",
  "closet": "Economy",
  "catalog": "Economy",
  "dress": "Economy",
  "shuffle": "Economy",
  "wardrobe": "Economy",
  "save": "Economy",
  "buy": "Economy",
  "display": "Economy",
  "store": "Economy",
  "backpack": "Economy",
  "trade": "Economy",
  "give": "Economy",
  "auction": "Economy",
  "randomizer": "Economy",
  "math": "Math",
  "convert": "Math",
  "simplify": "Math",
  "equation": "Math",
  "bake": "Bakery",
  'open': "Bakery",
  "stock": "Bakery",
  "sell": "Bakery",
  "daily": "Bakery",
  "shop": "Bakery",
  "upgrade": "Bakery",
  "craft": "Bakery",
  "table": "Bakery",
  "brewery": "Bakery",
  "brew": "Bakery",
  "drink": "Bakery",
  "simple": "Commands",
  "commands": "Commands",
  "bakery": "Commands",
  "statistics": "Commands",
  "economy": "Commands",
  "banking": "Commands",
  "openai": "Commands",
  "banking": "Commands",
  "hacks": "Commands",
  "ai": "Open AI",
  "bank": "Banking",
  "deposit": "Banking",
  "withdrawal": "Banking",
  "invest": "Banking",
  "cashout": "Banking"
}

module.exports = {
  name: "commandInfo",
  description: "Keeps track of the commands sent by a user",

  // creates and sends an embed with the users command stats
  commandInfo(message, Discord, client){
    let id = general.getId(message, client);
    let serverId = message.guild.id;
    let channelId = message.channel.id;
    let data = general.readFile();

    var total = "";
    try{total = data.stats.personal[id].commands.total}
    catch{total = "n/a"}

    let topTypes = "";
    try{
      for (let type of data.stats.personal[id].commands.topTypes){
        topTypes += type.id + ": " + type.total + "\n";
      }
    }catch{topTypes = "n/a"}

    let topCommands = "";
    try{
      for (let command of data.stats.personal[id].commands.topCommands){
        topCommands += "\n" + command.id + ": " + command.total;
      }
    }catch{topCommands = "n/a"}

    let self = general.embedInfo(id, client);

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Total:", value: total, inline: true},
        {name: "Top Types:", value: topTypes, inline: true},
        {name: "Top Commands:", value: topCommands, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    message.channel.send(embed).catch();
  },

  commandUse(message, command){
    let custom = general.readFile("JSONFiles/custom.json");
    custom = custom[message.author.id] // will be null if the person doesnt have any custom commands

    if (custom == null){ // if the user doesnt have customs, give them an empty list
      custom = {};
    }

    let id = message.author.id;

    // check to see if this person used a command in the first place
    if (commands[command] != null || custom[command] != null){

      // get the type, if there is none, than it must be a custom
      let type = commands[command] != null ? commands[command] : "custom"

      let data = general.readFile();

      // increase the bot xp and adjust level if need be
      data.stats.global.bot.xp += 10 * data.stats.personal[id].level;
      if (data.stats.global.bot.xpNeeded <= data.stats.global.bot.xp){
        data.stats.global.bot.xpNeeded *= 2;
        data.stats.global.bot.level++;
      }

      data.stats.global.bot.commands.total++;
      
      if (data.stats.global.bot.commands.command[command] == null){
        data.stats.global.bot.commands.command[command] = {total: 0, type: type};
      }
      data.stats.global.bot.commands.command[command].total++;
      data.stats.global.bot.commands.command.top = general.newTop(data.stats.global.bot.commands.command.top, {id: command, total: data.stats.global.bot.commands.command[command].total}, 10);

      if (data.stats.global.bot.commands.types[type] == null){
        data.stats.global.bot.commands.types[type] = {total: 0};
      }
      data.stats.global.bot.commands.types[type].total++;
      data.stats.global.bot.commands.types.top = general.newTop(data.stats.global.bot.commands.types.top, {id: type, total: data.stats.global.bot.commands.types[type].total}, 10);

      if (data.stats.personal[id].commands == null){
        data.stats.personal[id].commands = {
          total: 0,
          topCommands: [], // fixed length of 10
          topTypes: [], // fixed length of 10
          types: {}
        }
      }

      data.stats.personal[id].commands.total++;

      // increase the command
      if (data.stats.personal[id].commands[command] == null){
        data.stats.personal[id].commands[command] = {
          total: 0, type: type
        }
      }
      data.stats.personal[id].commands[command].total++;
      // resort the top commands
      data.stats.personal[id].commands.topCommands = general.newTop(data.stats.personal[id].commands.topCommands, {id: command, total: data.stats.personal[id].commands[command].total}, 10);
      

      // check for the type
      if (data.stats.personal[id].commands.types[type] == null){
        data.stats.personal[id].commands.types[type] = 0;
      }
      data.stats.personal[id].commands.types[type]++;

      // resort the top
      data.stats.personal[id].commands.topTypes = general.newTop(data.stats.personal[id].commands.topTypes, {id: type, total: data.stats.personal[id].commands.types[type]}, 10);

      general.writeFile(data);
    }
  }
}