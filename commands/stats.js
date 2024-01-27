//let data = general.general.general.module.exports.readFile();
const fs = require("fs");
const general = require("./general");

module.exports = {
  name: "stats",
  description: "keeps track of a persons stats",

  // creates and send an embed filled with a users basic info
  stats(message, Discord, client){
    let id = general.getId(message, client);
    let serverId = message.guild.id;
    let channelId = message.channel.id;
    let data = general.readFile();

    let level = "";
    try{
      level = "**Level:** " + data.stats.personal[id].level + "\n**Bits:** " + data.stats.personal[id].zeros + "\n**Messages:** " + data.stats.personal[id].messages.total;
    }catch{
      level = "n/a";
    }
    
    let messageServer = "";
    try {
      // this needs to be limited
      for (let i=0; i<3 && i<data.stats.personal[id].messages.servers.top.length; i++){
        var top = data.stats.personal[id].messages.servers.top[i]
        messageServer += "\n" + client.guilds.cache.get(top.id).name + ": " + top.total;
      }
    }catch{
      messageServer = "n/a";
    }

    let mostPinged = "N/A";
    try{
      if (data.stats.personal[id].messages.pinged != null){
        mostPinged = client.users.cache.get(data.stats.personal[id].messages.pinged.top).username + ": " + data.stats.personal[id].messages.pinged[data.stats.personal[id].messages.pinged.top];
        mostPinged += "\nTotal: " + data.stats.personal[id].messages.pinged.total;
      }
    }catch{
      mostPinged = "n/a";
    }

    let voiceChat = "{*Coming soon*}";

    var topChannels = ""; // local top channels
    try {
      for (let i=0; i<3&&i<data.stats.personal[id].messages.servers[serverId].channels.top.length; i++){
        let top = data.stats.personal[id].messages.servers[serverId].channels.top[i]
        topChannels += "\n " + client.guilds.cache.get(serverId).channels.cache.get(top.id).name + ": " + top.total;
      }
    }catch{
      topChannels = "n/a";
    }
    
    messageChannels = ""; // global top channels
    try{
      for (let i=0; i<3 && i < data.stats.personal[id].messages.topChannels.length; i++){
        let top = data.stats.personal[id].messages.topChannels[i];
        messageChannels += "\n " + client.channels.cache.get(top.id).name + ": " + top.total;
      }
    }
    catch{
      messageChannels = "";
    }

    let used = "n/a";

    let topCommandTypes = "";
    try {
      if (data.stats.personal[id].commands == null){
        topCommandTypes = "n/a";
      }else{
        for (let i=0; i<3 && i < data.stats.personal[id].commands.topTypes.length; i++){
          topCommandTypes += "\n" + data.stats.personal[id].commands.topTypes[i].id + ": " + data.stats.personal[id].commands.topTypes[i].total;
        }
      }
    }catch{
      topCommandTypes = "n/a";
    }

    let self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: 'General:', value: level, inline: true},
        {name: "Top Servers:", value: messageServer, inline:true},
        {name: "Most Pinged:", value: mostPinged, inline:true},
        //{ name: '\u200b', value: '\u200b'},
        { name: 'Voice Chat:', value: voiceChat, inline: true},
        {name: "Top Channels:", value: messageChannels, inline:true},
        {name: "Top Command Types:", value: topCommandTypes, inline:true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  // creates and sends an embed showcasing users message info
  messageInfo(message, Discord, client){
    let id = general.getId(message, client);
    let serverId = message.guild.id;
    let channelId = message.channel.id;
    let data = general.readFile();

    // makes sure to come back and take into account n/a's
    let messageToSend = "";
    try{
      messageToSend = "Total: ";
      messageToSend += data.stats.personal[id].messages.total + "\n";
      messageToSend += "Most Pinged: " + client.users.cache.get(data.stats.personal[id].messages.pinged.top).username + "\n";
      messageToSend += "Top Command: " + data.stats.personal[id].commands.topCommands[0].id;
    }catch{
      messageToSend = "n/a";
    }

    let topServers = "";
    try{
      for (let i=0; i<5 && i<data.stats.personal[id].messages.servers.top.length; i++){
        topServers += "\n" + client.guilds.cache.get(data.stats.personal[id].messages.servers.top[i].id).name + ": " + data.stats.personal[id].messages.servers.top[i].total;
      }
    }catch{
      topServers = "n/a";
    }

    let topGlobalChannels = "";
    try{
      for (let i=0; i<5 && i<data.stats.personal[id].messages.topChannels.length; i++){
        var channel = data.stats.personal[id].messages.topChannels[i]
        topGlobalChannels += "\n" + client.guilds.cache.get(channel.serverId).channels.cache.get(channel.id).name + ": " + channel.total;
      }
    }catch{topGlobalChannels = "n/a"}

    topLocalChannels = "";
    try{
      for (let i=0; i<5 && i<data.stats.personal[id].messages.servers[serverId].channels.top.length; i++){
        let channel = data.stats.personal[id].messages.servers[serverId].channels.top[i];

        topLocalChannels += "\n" + client.guilds.cache.get(serverId).channels.cache.get(channel.id).name + ": " + channel.total;
      }
    }catch{topLocalChannels = "n/a"}

    let self = general.embedInfo(id, client);

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Messages: ", value: messageToSend, inline: true},
        {name: "Top channels", value: topGlobalChannels, inline: true},
        {name: "\u200b", value: "\u200b", inline: true},
        {name: "Top servers", value: topServers, inline: true},
        {name: "Top local channels", value: topLocalChannels, inline: true},
        {name: "\u200b", value: "\u200b", inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  // increases message stats everytime a message is sent
  messageSent(message, args){ 
    let id = message.author.id;
    let serverId = message.guild.id;
    let channelId = message.channel.id;
    let data = general.readFile();

    // goes through each pinged user and increases the users pinged stats with that person
    function pinged(data, message){
      let pingedUsers = message.mentions.users;
      if (pingedUsers.first() != null){
        if (data.stats.personal[id].messages["pinged"] == null){
          let firstPingedId = pingedUsers.first().id
          data.stats.personal[id].messages.pinged = {top: firstPingedId, total: 0, firstPingedId: 0}
        }

        pingedUsers.forEach(user => {
          var userId = user.id;
          data.stats.personal[id].messages.pinged.total++;

          if (data.stats.personal[id].messages.pinged[userId] == null){
            data.stats.personal[id].messages.pinged[userId] = 0
          }
          data.stats.personal[id].messages.pinged[userId]++;

          if (data.stats.personal[id].messages.pinged[userId] > data.stats.personal[id].messages.pinged[data.stats.personal[id].messages.pinged.top]){
            data.stats.personal[id].messages.pinged.top = userId;
          }

        })
      }

      return data
    }

    // creates stats key:value items if users are missing them
    if (data.stats.personal[id] == null){
      data["stats"]["personal"][id] = {}
    }

    // increases general stats
    data = general.generalIncrease(message.author.id, serverId, 1, data);

    // increases totals and reorganizes the top
    if (data.stats.personal[id]["messages"] == null){
      data.stats.personal[id]["messages"] = {total: 0, servers: {top: []}}
    }

    // total
    data.stats.personal[id]["messages"].total++;

    if (data.stats.personal[id]["messages"].servers[serverId] == null){
      data.stats.personal[id]["messages"].servers[serverId] = {total: 0, channels: {top: []}}; 
    }

    // server total
    data.stats.personal[id]["messages"].servers[serverId].total++;

    if (data.stats.personal[id]["messages"].servers[serverId].channels[channelId] == null){
      data.stats.personal[id]["messages"].servers[serverId].channels[channelId] = {total: 0}
    }

    // channel total
    data.stats.personal[id]["messages"].servers[serverId].channels[channelId].total++;

    // sort server top
    data.stats.personal[id]["messages"].servers.top = general.newTop(data.stats.personal[id]["messages"].servers.top, {id: serverId, total: data.stats.personal[id]["messages"].servers[serverId].total}, null);

    // sort channel top
    data.stats.personal[id]["messages"].servers[serverId].channels.top = general.newTop(data.stats.personal[id]["messages"].servers[serverId].channels.top, {id: channelId, total: data.stats.personal[id]["messages"].servers[serverId].channels[channelId].total}, null);

    if (data.stats.personal[id]["messages"].topChannels == null){
      data.stats.personal[id]["messages"].topChannels = [];
    }

    // sort global top
    data.stats.personal[id]["messages"].topChannels = general.newTop(data.stats.personal[id]["messages"].topChannels, {id: channelId, total: data.stats.personal[id]["messages"].servers[serverId].channels[channelId].total, serverId: serverId}, null);

    data = pinged(data, message);

    general.writeFile(data)
  },
}