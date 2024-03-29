const DataManager = require('./DataManager');
const general = require('./general');

module.exports = {
  name: "generalStats",
  description: "holds some of the more generalized stats",

  serverStats(message, Discord, client){
    var generalInfo = "";
    var topChannels = "";
    var topUsers = "";

    var data = general.readFile();
    var serverId = message.guild.id;
    var id = general.getId(message, client);

    try{
    generalInfo += "Level: " + data.stats.global.servers[serverId].level + "\nXP: " + data.stats.global.servers[serverId].xp + "\nNext Level Up: " + data.stats.global.servers[serverId].xpNeeded + "\nMost Pinged: {*coming soon*}";
    }catch{generalInfo = "n/a"}

    try{
      for (let i=0; i<5 && i<data.stats.global.servers[serverId].channels.top.length; i++){
        topChannels += "\n" + client.channels.cache.get(data.stats.global.servers[serverId].channels.top[i].id).name + ": " + data.stats.global.servers[serverId].channels.top[i].total;
      }
    }catch{topChannels = "n/a"}

    try{
      for (let i=0; i<5 && i<data.stats.global.servers[serverId].users.top.length; i++){
        topUsers += "\n" + client.users.cache.get(data.stats.global.servers[serverId].users.top[i].id).username + ": " + data.stats.global.servers[serverId].users.top[i].total;
      }
    }catch{topUsers = "n/a"}


    let self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: 'General Info:', value: generalInfo, inline: true},
        {name: "Top Channels:", value: topChannels, inline:true},
        {name: "Top Users:", value: topUsers, inline:true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  channelStats(message, Discord, client){
    var serverId = message.guild.id;
    var channelId = message.channel.id;
    var id = general.getId(message, client);
    var data = general.readFile();

    var self = general.embedInfo(id);

    var channelInfo = "";
    try{
      channelInfo = "Level: " + data.stats.global.servers[serverId].channels[channelId].level + "\nXP: " + data.stats.global.servers[serverId].channels[channelId].xp + "\nNext level up: " + data.stats.global.servers[serverId].channels[channelId].xpNeeded;
    }catch{channelInfo = "n/a"}

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: 'Channel Info:', value: channelInfo, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  bot(message, Discord, client){
    var generalInfo = null;
    var bitsInto = null;
    var topServers = "";
    var topCommands = "";
    var topUsers = "";
    var botInfo = null;
    var id = general.getId(message, client)

    let data = general.readFile();
    
    generalInfo = "Version: 1.0.0\nTotal Servers: " + data.stats.global.servers.total + "\nCommands used: " + data.stats.global.bot.commands.total;

    bitsInfo = "Total: " + data.stats.global.bot.bits.total + "\nSpent: " + data.stats.global.bot.bits.spent;

    var servers = data.stats.global.servers.top;
    for (var i=0; i<servers.length && i<3; i++){
      topServers += "\n" + client.guilds.cache.get(servers[i].id).name + ": "+ servers[i].total
    }
    if (topServers == ""){
      topServers = "n/a";
    }

    var commands = data.stats.global.bot.commands.command.top;
    for (var i=0; i< commands.length && i<3; i++){
      topCommands += "\n" + commands[i].id + ": " + commands[i].total;
    }
    if (topCommands == ""){
      topCommands = "n/a";
    }

    users = data.stats.global.users.top;
    for (var i=0; i<users.length && i<3; i++){
      topUsers += "\n" + client.users.cache.get(users[i].id).username + ": " + users[i].total;
    }
    if (topUsers == ""){
      topUsers = "n/a";
    }

    botInfo = "Level: " + data.stats.global.bot.level + "\nxp: " + data.stats.global.bot.xp + "\nxp needed: " + data.stats.global.bot.xpNeeded;


    let self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: 'General Info:', value: generalInfo, inline: true},
        {name: "Top Servers:", value: topServers, inline:true},
        {name: "Top commands:", value: topCommands, inline:true},
        //{ name: '\u200b', value: '\u200b'},
        { name: 'Bot info:', value: botInfo, inline: true},
        {name: "Top Users:", value: topUsers, inline:true},
        {name: "Bits *{not accurate}*:", value: bitsInfo, inline:true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  messageSent(message, args){
    // keeps track of the servers and channels levels and tops
    let id = message.author.id;
    let serverId = message.guild.id;
    let channelId = message.channel.id;
    
    var dm = new DataManager("JSONFiles/data.json");

    // if its a new server, add one, likewise to the array
    // figure this out buddy boi

    
    // ups the xp by for both channel and server
    dm.set("serverXP", 
        dm.get("serverXP", [serverId], 0) + 5, 
    [serverId]);
    dm.set("channelXP", 
        dm.get("channelXP", [serverId, channelId], 0) + 5, 
    [serverId, channelId]);

    // checks if new xp warrants level up for server
    if (dm.get("serverXPneeded", [serverId], 100) <= dm.get("serverXP", [serverId])){
        
        dm.set("serverLevel", 
            dm.get("serverLevel", [serverId], 0) + 1,
        [serverId]);

        dm.set("serverXPneeded", 
            dm.get("serverXPneeded", [serverId]) * 2,
        [serverId]);

      dm.updateArray("!topChannelsInServer", serverId, "serverLevel", [serverId], [serverId], 0);
    }

    // checks if channels need level up
    if (dm.get("channelXPneeded", [serverId, channelId], 100) <= dm.get("channelXP", [serverId, channelId])){

        dm.set("channelLevel", 
            dm.get("channelLevel", [serverId, channelId], 0) + 1,
        [serverId]);

        dm.set("channelXPneeded", 
            dm.get("channelXPneeded", [serverId, channelId]) * 2,
        [serverId]);

        dm.updateArray("!topChannelsInServer", channelId, "channelLevel", [serverId], [serverId, channelId], 0);
    }

    dm.close();
  },
}