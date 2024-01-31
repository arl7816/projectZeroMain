const fs = require("fs");
//const hack = require("./hacks"); // big taboo but like, whos ever going to look at this

const DataManager = require("./DataManager");

module.exports = {
  name: "general",
  description: "",

  // increases general stats that are shared among all interactions
  generalIncrease(userId, serverId, xp=1, data=null){
    //var hacks = module.exports.readFile("JSONFiles/hacks.json");
    var hackDefault = module.exports.readFile("JSONFiles/hackDefault.json");
    var hacks = new DataManager("JSONFiles/hacks.json", "JSONFiles/mapper.json");

    if (hacks.checkPath("hacks->users->*userId->time->boost", [userId])){
      var deltaTime = Math.abs(new Date().getTime() / 1000 - hacks.get("hacksTimeStartTime", [userId, "boost"], 0));
      if (hackDefault.hacks["tier1"]["boost"].maxTime - deltaTime > 0){
        xp *= 2
      }
    }

    data.updateArray("!topUsersGlobal", userId, "userLevel", null, [userId], 0);

    data.updateArray("!topUsersInServer", userId, "userLevel", [serverId], [userId], 0);


    data.update("userXP", [userId], x => x + (x * data.get("userLevel", [userId], 0) + 1), 0)
    if (data.get("userXP", [userId], 0) >= data.get("userXPneeded", [userId], 100)){
        data.update("userXPneeded", [userId], x => x * 2);
        data.update("userLevel", [userId], x => x + 1);
    }

    //

    if (hacks.checkPath("hacks->users->*userId->time->fishing_line", [userId])){
      var deltaTime = Math.abs(new Date().getTime() / 1000 - hacks.get("hacksTimeStartTime", [userId, "fishing_line"], 0))
      if (hackDefault.hacks["tier1"]["fishing_line"].maxTime - deltaTime > 0){
        data.update("userBits", [userId], x => x + 5, 0);
      }
    }

    data.update("userBits", [userId], x => x + 1, 0);
    data.update("botTotalBits", null, x => x + 1, 0);

    hacks.close();

    return data;
  },

  convertTime(seconds){
    var minutes = 0;
    var hours = 0;
    seconds = Math.floor(seconds);

    minutes = Math.floor(seconds/60);
    seconds %= 60;

    hours = Math.floor(minutes / 60);
    minutes %= 60;

    var time = "";

    if (hours > 0){
      if (hours < 10){
        time += "0";
      }
      time += hours + ":"
    }

    if (minutes < 10){time += "0"}
    time += minutes + ":";

    if (seconds < 10){time += "0"}
    time += seconds;

    return time;
  },

  // if a person is pinged or their name is given, return their id; otherwise, return the users id.
  getId(message, client){
    var pinged = message.mentions.users.first();
    if (pinged != null){
      return pinged.id;
    }

    var content = message.content.substring(message.content.indexOf(" ")+1);
    content = content.trim();

    if (content != "" && content != null){
      var user = client.users.cache.find(user => user.tag === content || user.username === content);
      if (user != null){
        return user.id
      }

      user = client.guilds.cache.get(message.guild.id).members.cache.find(member => member.nickname === content);
      if (user != null){
        return user.id;
      }
    }

    return message.author.id;
  },


  // gathers and returns a persons embed info 
  embedInfo(id, client){
    function getRandom(attribute){
      if (attribute == null){
        return null;
      }

      items = Object.keys(attribute);

      if (items.length == 0){
        return null;
      }

      var item = attribute[items[Math.floor(Math.random() * items.length)]]
      //console.log(item);
      return item
    }

    var data = module.exports.readFile();
    //var hacks = module.exports.readFile("JSONFiles/hacks.json");

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }

    var self = data.econ.inventory[id].custom.self
    if (data.econ.inventory[id].custom.self.random == true){
      self.color = getRandom(data.econ.inventory[id].custom.color);
      self.url = getRandom(data.econ.inventory[id].custom.url);
      self.title = getRandom(data.econ.inventory[id].custom.title);
      self.author = getRandom(data.econ.inventory[id].custom.author);
      self.authorImage = getRandom(data.econ.inventory[id].custom.authorImage);
      self.description = getRandom(data.econ.inventory[id].custom.description);
      self.thumbnail = getRandom(data.econ.inventory[id].custom.thumbnail);
      self.footer = getRandom(data.econ.inventory[id].custom.footer);

      module.exports.writeFile(data)
    }

    // if a person does not have a attribute than a default one is given
    var info = {};
    if (self.color == null){
      self.color = "#FFFFFF"
    }
    info.color = self.color;

    info.title = self.title == null? "Stats": self.title;

    info.url = 'https://discord.js.org/'
    
    info.author = self.author==null || self.author == "default"? client.users.cache.get(id).username : self.author;

    info.authorImage = self.authorimage==null? 'https://p.kindpng.com/picc/s/36-365901_nerd-glasses-transparent-background-nerd-glasses-icon-png.png': self.authorimage;

    info.description = self.description==null? "All of your stats": self.description;

    info.thumbnail = self.thumbnail==null? 'https://datatron.com/wp-content/uploads/2021/03/Data-Science.png': self.thumbnail;

    info.footer = self.footer==null? 'Your stats': self.footer;

    return info;
  },

  baseEmbed(message, Discord, client){
    data = module.exports.readFile();

    let id = module.exports.getId(message, client);

    var self = module.exports.embedInfo(id, client)

    let embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    return embed;
  },

  // creates and sends an embed message showing your level stats
  levelInfo(message, Discord, client){
    data = module.exports.readFile();

    let id = module.exports.getId(message, client);

    if (data.stats.personal[id] == null){
      message.channel.send("N/A").catch();
      return;
    }

    let level = data.stats.personal[id].level;
    let xp = data.stats.personal[id].xp;
    let neededXp = data.stats.personal[id].neededXp;

    var self = module.exports.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Level: ", value: level, inline: true},
        {name: "XP", value: xp, inline: true},
        {name: "Needed XP", value: neededXp, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();

  },

  bits(message, Discord, client){
    var id = module.exports.getId(message, client);
    var data = module.exports.readFile();
    var bits = 0;
    var spent = 0;
    var total = 0;

    try {
      bits = data.stats.personal[id].zeros;
      
    }catch{

    }

    var self = module.exports.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Bits: ", value: level, inline: true},
        {name: "Total", value: xp, inline: true},
        {name: "Spent", value: neededXp, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },

  newTop(top, mani, max){ // require every item in the array to have an id and total component

      // when an item is updated, it is resorted in the array
      function sortTop(top, index){ 
        if (index > 0){
          // move the item until the next item is greater or the end the of the list is reached
          while (top[index-1].total < top[index].total){

            temp = top[index-1]
            top[index-1] = top[index]
            top[index] = temp;

            index--;
            if (index == 0){
              break;
            }
          }
        }
        return top;
      }

      // if the manipulated item is already is the list, update it and sort it
      for (let i=0; i<top.length; i++){
        if (top[i].id == mani.id){
          top[i] = mani;
          top = sortTop(top, i);
          return top;
        }
      }

      // if the length of the list is less than the max, append the item and sort
      if (max == null || top.length < max){
        top.push(mani);
        top = sortTop(top, top.length-1);
        return top;
      }

      // if the item is greater than the last item in the list, replace it and sort
      if (top[top.length-1].total < mani.total){
        top[top.length-1] = mani;
        top = sortTop(top, top.length-1);
        return top;
      }

      return top;
  },

  // reads and returns a json file. If no fileName is given, returns basic data
  readFile(fileName = "JSONFiles/data.json"){
    let data = fs.readFileSync(fileName).toString();

    //try{data=JSON.parse(data);}catch{}
    data = JSON.parse(data);

    return data
  },

  // rewrites data into a json file. If no json file is given than the it will use basic data as a default.
  writeFile(data, fileName = "JSONFiles/data.json"){
    data = JSON.stringify(data, null, "\t");
    fs.writeFileSync(fileName, data);
  }
}