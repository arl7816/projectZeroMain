const general = require("./general")

module.exports = {
  name: "hacks",
  description: "Holds the commands for hack items",

  getHacks(id){
    let data = general.readFile("JSONFiles/hacks.json");

    if (data.users[id] == null){
      data.users[id] = {
        time: {},
        item: {},
        perm: {}
      }
    }
    if (data.users[id].firewall == null){
      data.users[id].firewall = 0;
    }

    return data;
  },

  getDefault(){
    return general.readFile("JSONFiles/hackDefault.json");
  },

  getTimeRemaining(startTime, maxTime){
    var currentTime = new Date().getTime() / 1000;
    var deltaTime = Math.abs(currentTime - startTime);

    return maxTime - deltaTime;
  },

  encrypt(message, args){
    // buys a hackz

    // find if the person typed in an item
    var content = message.content.split(" ")[1];
    var id = message.author.id;

    if (content == "" || content == null){
      message.channel.send("Invalid input").catch();
      return;
    }
    content = content.trim();

    var hacks = module.exports.getHacks(message.author.id);
    var hackDefault = module.exports.getDefault();
    var data = general.readFile();

    var tier = null;
    var item = null
    var tierIndex = 0;
    for (let tempTier of Object.keys(hackDefault.hacks)){
      tierIndex++;
      if (hackDefault.hacks[tempTier][content] != null){
        tier = tempTier;
        item = hackDefault.hacks[tempTier][content];
        break;
      }
    }

    if (tier == null){
      message.channel.send("Could not find item").catch();
      return;
    }

    if (tierIndex > hacks.users[id].firewall){
      message.channel.send("You don't have a high enough firewall").catch();
      return;
    }

    // if perm and active -> dont let buy
    if (item.type == "perm" && hacks.users[message.author.id][item.type][content]){
      if (hacks.users[message.author.id][item.type][content].active == true){
        message.channel.send("Cant buy this item again").catch();
        return;
      }
    }

    // check if they afford it
    if (item.price > data.stats.personal[message.author.id].zeros){
      message.channel.send("You can not afford this item").catch();
      return;
    }

    // give them it
    switch (item.type){
      case 'time':
        hacks.users[message.author.id][item.type][content] = {
          startTime: new Date().getTime() / 1000
        }
        break;
      case 'item':
        if (hacks.users[message.author.id][item.type][content] == null){
          hacks.users[message.author.id][item.type][content] = {
            total: 0
          }
        } 
        hacks.users[message.author.id][item.type][content].total += hackDefault.hacks[tier][content].amount;
        break;
      case 'perm':
        hacks.users[message.author.id][item.type][content] = {
          active: true
        }
        break;
      default:
        console.log("Wrong type");
        return;
        break;
    }

    // take away their bits
    var price = item.price;
    data.stats.personal[id].zeros -= price;
    data.stats.global.bot.bits.spent += price

    if (data.econ.inventory[id].spent == null){
      data.econ.inventory[id].spent = 0;
    }
    data.econ.inventory[id].spent += price;

    // rewrite all the data

    general.writeFile(data);
    general.writeFile(hacks, "JSONFiles/hacks.json");
    message.channel.send("Hack aquired").catch();
  },

  decrypt(message, Discord, client){
    const show = (key, hack, personalHack) => {
      switch (hack.type){
        case 'time':
          if (personalHack[key] == null){
            return key + ": 0:00" + " {price: " + hack.price + "}";
          }

          var currentTime = new Date().getTime() / 1000;
          var deltaTime = Math.abs(currentTime - personalHack[key].startTime);

          var timeRemaining = hack.maxTime - deltaTime;

          if (timeRemaining >= 0){
            return key + ": " + general.convertTime(timeRemaining) + " {price: " + hack.price + "}";
          }

          return key + ": 0:00" + " {price: " + hack.price + "}";
        case 'perm':
          if (personalHack[key] == null){
            return key + ": x" + " {price: " + hack.price + "}";
          }
          
          return key + ": " + (personalHack[key].active == true ? "o" : "x") + " {price: " + hack.price + "}";
        case 'item':
          if (personalHack[key] == null){
            return key + ": 0" + " {price: " + hack.price + "}";
          }

          if (personalHack[key].total <= 0){
            return key + ": 0" + " {price: " + hack.price + "}";
          }

          return key + ": " + personalHack[key].total + " {price: " + hack.price + "}";
        default:
          console.log(key + " was not a hack type")
          return "n/a";
      }

      return "";
    }

    const tier = (tierName, defaultHacks, hacks, id) => {
      var tier = "";
      for (let hack of Object.keys(defaultHacks.hacks[tierName])){
        var item = defaultHacks.hacks[tierName][hack]
        tier += "\n" + show(hack, item, hacks.users[id][item.type]);
      }
      return tier; 
    }

    // shows you all availble hacks
    /*
      three types of hacks:
        item -> can only use the item a certain number of times
        perm -> hackz auto activate upon purchase and stay on
        time -> time based hacks
    */

    var hacks = module.exports.getHacks(message.author.id);
    var hackDefault = module.exports.getDefault();
    var id = general.getId(message, client);

    var tier1 = tier("tier1", hackDefault, hacks, message.author.id);
    var tier2 = tier("tier2", hackDefault, hacks, message.author.id);
    var tier3 = tier("tier3", hackDefault, hacks, message.author.id);
    //tier3 = "n/a"

    var self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description + "**\nFirewall: " + hacks.users[id].firewall + "**")
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Tier 1: ", value: tier1, inline: true},
        {name: "Tier 2: ", value: tier2, inline: true},
        {name: "Tier 3: ", value: tier3, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },

  hack(message, Discord, client){
    // use item based hacks
    let hackDefault = module.exports.getDefault();
    let hacks = module.exports.getHacks(message.author.id)
    var content = message.content.split(" ")[1];
    if (content == null || content == " "){
      message.channel.send("Invalid input").catch();
    }
    if (content == null){
      message.channel.send("Incorrect input");
      return;
    }
    content = content.trim()

    var item = null;
    // can remove the second for loop using 'in'
    for (let tier of Object.keys(hackDefault.hacks)){
      for (let hack of Object.keys(hackDefault.hacks[tier])){
        if (content == hack){
          item = hackDefault.hacks[tier][hack]
        }
      }
    }

    if (item == null){
      message.channel.send("Could not find that hack").catch();
      return;
    }
    if (hacks.users[message.author.id][item.type][content] == null){
      message.channel.send("You dont have any of that item").catch();
      return;
    }
    if (item.type != "item"){
      message.channel.send("Can't use this item").catch();
      return;
    }
    if (hacks.users[message.author.id][item.type][content].total <= 0){
      message.channel.send("You dont have any to use").catch();
      return;
    }

    switch (content){
      case 'gift':
        var id = general.getId(message, client);
        var serverId = message.guild.id;
        if (id == message.author.id){
          message.channel.send("Cant send yourself bits").catch();
          return;
        }

        var data = general.readFile();
        if (data.stats.personal[id] == null){
          data.stats.personal[id] = {};
        }

        if (data.stats.personal[id]["level"] == null){
          data.stats.personal[id]["level"] = 1;
          data.stats.personal[id]["xp"] = 0; // current xp
          data.stats.personal[id]["neededXp"] = 100;

          data.stats.global.users.top = module.exports.newTop(data.stats.global.users.top, {id: id, total: data.stats.personal[id].level}, null);

          if (data.stats.global.servers[serverId] == null){data.stats.global.servers[serverId] = {};}
          if (data.stats.global.servers[serverId].users == null){data.stats.global.servers[serverId].users = {top: []}};
          
          //console.log(data.stats.global.servers[serverId])

          data.stats.global.servers[serverId].users.top = module.exports.newTop(data.stats.global.servers[serverId].users.top, {id:id, total: data.stats.personal[id].level}, null); 
        }

        // remove the gift item
        hacks.users[message.author.id]["item"]["gift"].total--;

        if (data.stats.personal[id]["zeros"] == null){
          data.stats.personal[id]["zeros"] = 0;
        }
        data.stats.personal[id].zeros += 1500
      
        general.writeFile(data);
        general.writeFile(hacks, "JSONFiles/hacks.json");
        message.channel.send("Gift sent").catch();

        break;
    }

  },

  sendEmbed(message, Discord, client){
    var id = message.author.id;
    content = message.content.substring(message.content.indexOf(" ")).trim()
    hacks = module.exports.getHacks(id);

    if (!hacks.users[id].perm["embed"] || !hacks.users[id].perm["embed"].active){
      message.channel.send("You do not have access to this command").catch();
      return;
    }

    if (content == ""){
      message.channel.send("Cant send an empty message").catch();
      return;
    }

    content = "**" + content + "**";

    let self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: '->', value: content, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed); // sends the embed
  },

  firewall(message, Discord, client){
    var id = message.author.id;
    var hacks = module.exports.getHacks(id);

    const getPrice = () => {
      switch (hacks.users[id].firewall){
        case 0:
          return 10000;
        case 1:
          return 100000;
        case 2:
          return 1000000;
        default:
          return null;
      }
    }

    var price = getPrice();
    if (price === null){
      message.channel.send("Cant upgrade your firewall further").catch();
      return;
    }

    var data = general.readFile();

    if (price > data.stats.personal[id].zeros){
      message.channel.send("You don't have enough bits. $" + price + " needed").catch();
      return;
    }

    data.stats.personal[id].zeros -= price;
    data.stats.global.bot.bits.spent += price
    hacks.users[id].firewall++;

    general.writeFile(data);
    general.writeFile(hacks, "JSONFiles/hacks.json");

    message.channel.send("Firewall upgraded to tier " + hacks.users[id].firewall).catch()
  },

  file(message, args){
    // shows the description of the hackz
    let hackDefault = module.exports.getDefault();
    var content = message.content.split(" ")[1];
    if (content == null || content == " "){
      message.channel.send("Invalid input").catch();
    }
    content = content.trim()


    for (let tier of Object.keys(hackDefault.hacks)){
      for (let hack of Object.keys(hackDefault.hacks[tier])){
        if (content == hack){
          message.channel.send(hackDefault.hacks[tier][hack].description).catch();
          return;
        }
      }
    }

    message.channel.send("Could not find hack").catch();
  }
}