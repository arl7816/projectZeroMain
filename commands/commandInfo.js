const DataManager = require("./DataManager");
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
    let customDm = new DataManager("JSONFiles/custom.json");

    let id = message.author.id;

    // check to see if this person used a command in the first place
    if (commands[command] != null || 
        customDm.checkAttri("#customCommand", [id], command) == true){

      // get the type, if there is none, than it must be a custom
      let type = commands[command] != null ? commands[command] : "custom"

      let dm = new DataManager("JSONFiles/data.json");

      dm.update("botXP", null, x => x + 10 * dm.get("userLevel", [id], 0));
      if (dm.get("botXPneeded") <= dm.get("botXP")){
        dm.update("botXPneeded", null, x => x * 2);
        dm.update("botLevel", null, x => x + 1);
      }

      customDm.update("totalCommandsUsed", null, x => x + 1);

      customDm.update("totalGlobalCommandUsed", [command], x => x + 1);
      customDm.updateArray("!topCommandsUsed", command, "totalGlobalCommandUsed", null, [command]);
      
      customDm.update("totalGlobalTypesUsed", [type], x => x + 1);
      customDm.updateArray("!topTypesUsed", type, "totalGlobalTypesUsed", null, [type]);
      
      
      customDm.update("totalPersonalCommandsUsed", [id], x => x + 1);


      // increase the command
      customDm.update("#totalPersonalCommand", [id], x => x + 1, command);
      // resort the top commands
      
      customDm.updateArray("!topPersonalCommands", command, "#totalPersonalCommand", [id], [id], command);

      customDm.update("#totalPersonalType", [id], x => x + 1, type);

      // resort the top
      customDm.updateArray("!topPersonalTypes", type, "#totalPersonalType", [id], [id], type);

      customDm.close();
      dm.close();
    }
  }
}