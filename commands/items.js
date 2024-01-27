const general  = require("./general")

module.exports = {
  name: "items",
  description: "holds the commands for item",

  checkTime(data, item, section, catagory, parameter, serverId){
    var serverId = serverId;

    // if the server hasnt had this added yet, add it
    if (data.econ.servers == null){
      data.econ.servers = {};
    }
    if (data.econ.servers[serverId] == null){
      data.econ.servers[serverId] = {};
    }
    if (data.econ.servers[serverId].items == null){
      data.econ.servers[serverId].items = {};
    }
    if (data.econ.servers[serverId].items[section] == null){
      data.econ.servers[serverId].items[section] = {};
    }
    if (data.econ.servers[serverId].items[section][catagory] == null){
      data.econ.servers[serverId].items[section][catagory] = {};
    }
    if (data.econ.servers[serverId].items[section][catagory][parameter] == null){
      data.econ.servers[serverId].items[section][catagory][parameter] = {
        lastReset: 0,
        total: item.maxCrop
      }
    }
    // check if time should reset, if so reset it
    serverItem = data.econ.servers[serverId].items[section][catagory][parameter];

    var deltaTime = (new Date().getTime() / 1000) - serverItem.lastReset;

    if (deltaTime > item.timeTillReset){
      var cycles = Math.round(deltaTime/item.timeTillReset);
      var amountEarned = cycles * item.yieldPerReset;

      data.econ.servers[serverId].items[section][catagory][parameter].total += amountEarned;
      if (data.econ.servers[serverId].items[section][catagory][parameter].total > item.maxCrop){
        data.econ.servers[serverId].items[section][catagory][parameter].total = item.maxCrop;
      }

      data.econ.servers[serverId].items[section][catagory][parameter].lastReset = new Date().getTime() / 1000;
    }

    return data;
  },

  buy(message, args){
    function makePurchase(data, id, section, catagory, parameter){
      if (data.econ.inventory[id].items[section][catagory][parameter] == null) {data.econ.inventory[id].items[section][catagory][parameter] = {total: 0}};
      data.econ.inventory[id].items[section][catagory][parameter].total++;
      data.stats.personal[id].zeros -= defaultEcon.items[section][catagory][parameter].price;
      data.stats.global.bot.bits.spent += defaultEcon.items[section][catagory][parameter].price

      if (data.econ.inventory[id].spent == null){
        data.econ.inventory[id].spent = 0;
      }
      data.econ.inventory[id].spent += defaultEcon.items[section][catagory][parameter].price 

      return data;
    }


    // get the content and parameter the person input
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var catagory = null;
    var parameter = null;

    var seperator = content.includes("#") ? "#": '"'
    
    catagory = content.substring(0,content.indexOf(seperator)).trim();

    parameter = content.substring(content.indexOf(seperator)+1)

    if (seperator == '"'){
      parameter = parameter.substring(0,parameter.indexOf('"'));
    }

    parameter =  parameter.trim();

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json");

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {}
    }
    if (data.econ.inventory[id].items == null){
      data.econ.inventory[id].items = {};
    }

    var section = null;
    if (!isNaN(parameter)){ // is a number
      var index = 0;
      var items = []
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (defaultEcon.items[tempSection][catagory] != null){
          items = items.concat(Object.keys(defaultEcon.items[tempSection][catagory]));
          if (items.length < parameter){
            continue;
          }

          section = tempSection;

          parameter = items[parameter-1];
          break;
        }
      }
    }else{
      var section = null;
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (defaultEcon.items[tempSection][catagory] != null){
          if (defaultEcon.items[tempSection][catagory][parameter] != null){
            section = tempSection;
            break;
          }
        }
      }
    }
    
    if (section == null){
      message.channel.send("Invalid input").catch();
      return;
    }
    if (section == "VIP"){
      message.channel.send("You cant buy from the VIP Section").catch();
      return;
    }
    if (defaultEcon.items[section][catagory][parameter] == null){
      message.channel.send("Invalid input").catch();
      return;
    }

    if (data.econ.inventory[id].items[section] == null){
      data.econ.inventory[id].items[section] = {};
    }
    if (data.econ.inventory[id].items[section][catagory] == null){
      data.econ.inventory[id].items[section][catagory] = {};
    }

    switch (section){
      case 'common': // these can be bought for an unlimited number of time
        if (defaultEcon.items[section][catagory][parameter].price > data.stats.personal[id].zeros){
          message.channel.send("You do not have enough bits").catch();
          return;
        }else{
          // make the purchase
          data = makePurchase(data, id, section, catagory, parameter);

          message.channel.send("Purchase was a success").catch();
          general.writeFile(data);
          return;
        }
        return;
      case 'farm': // these items reappear over time
        // check if any are availble for the server
        data = module.exports.checkTime(data, defaultEcon.items[section][catagory][parameter], section, catagory, parameter, message.guild.id);

        if (data.econ.servers[message.guild.id].items[section][catagory][parameter].total <= 0){
          message.channel.send("No more available").catch();
          return;
        }

        // check if the person can afford it
        if (defaultEcon.items[section][catagory][parameter].price > data.stats.personal[id].zeros){
          message.channel.send("You do not have enough bits").catch();
          return;
        }else{
          // make the purchase
          data = makePurchase(data, id, section, catagory, parameter);

          data.econ.servers[message.guild.id].items[section][catagory][parameter].total--;
          message.channel.send("Purchase was a success").catch();
          general.writeFile(data);
          return;
        }
        // buy it and tell them
        return;
      case 'mythic': // these items only appear once a server
        // check if the server has it, if not add it
        var serverId = message.guild.id;
        if (data.econ.servers == null){
          data.econ.servers = {};
        }
        if (data.econ.servers[serverId] == null){
          data.econ.servers[serverId] = {};
        }
        if (data.econ.servers[serverId].items == null){
          data.econ.servers[serverId].items = {};
        }
        if (data.econ.servers[serverId].items[section] == null){
          data.econ.servers[serverId].items[section] = {};
        }
        if (data.econ.servers[serverId].items[section][catagory] == null){
          data.econ.servers[serverId].items[section][catagory] = {};
        }
        if (data.econ.servers[serverId].items[section][catagory][parameter] == null){
          data.econ.servers[serverId].items[section][catagory][parameter] = {total: 0};
        }
        // check if the server has any remaining
        deltaBought = defaultEcon.items[section][catagory][parameter].maxPerServer -  data.econ.servers[serverId].items[section][catagory][parameter].total;

        if (deltaBought <= 0){
          message.channel.send("No more available").catch();
          return;
        }

        // check if one can be bought
        if (defaultEcon.items[section][catagory][parameter].price > data.stats.personal[id].zeros){
          message.channel.send("You do not have enough bits").catch();
          return;
        }else{
          // make the purchase
          data = makePurchase(data, id, section, catagory, parameter);

          data.econ.servers[message.guild.id].items[section][catagory][parameter].total++;
          message.channel.send("Purchase was a success").catch();
          general.writeFile(data);
          return;
        }
        return;
      case 'universal': // these are limited by the bots personal inventory
        if (data.econ.universal[catagory] == null){
          data.econ.universal[catagory] = {}
        }
        if (data.econ.universal[catagory][parameter] == null){
          data.econ.universal[catagory][parameter] = {total: 0}
        }
        
        if (defaultEcon.items[section][catagory][parameter].max - data.econ.universal[catagory][parameter].total <= 0){
          message.channel.send("Out of stock").catch();
          return;
        }

        if (defaultEcon.items[section][catagory][parameter].price > data.stats.personal[id].zeros){
          message.channel.send("You do not have enough bits").catch();
          return;
        }

        data = makePurchase(data, id, section, catagory, parameter);  
        data.econ.universal[catagory][parameter].total++;
        message.channel.send("Purchase was a success").catch();
        general.writeFile(data);       

        return;
      case 'limited': // limited timed items {do this later}
        return;
    }
  },

  display(message, args){
    // get the content and parameter the person input
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var catagory = null;
    var parameter = null;

    var seperator = content.includes("#") ? "#": '"'
    
    catagory = content.substring(0,content.indexOf(seperator)).trim();

    parameter = content.substring(content.indexOf(seperator)+1)

    if (seperator == '"'){
      parameter = parameter.substring(0,parameter.indexOf('"'));
    }

    parameter =  parameter.trim();

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json");

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {}
    }
    if (data.econ.inventory[id].items == null){
      data.econ.inventory[id].items = {};
    }

    var section = null;
    if (!isNaN(parameter)){ // is a number
      var index = 0;
      let items = []
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (data.econ.inventory[id].items[tempSection] == null){continue;}
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          items = items.concat(Object.keys(data.econ.inventory[id].items[tempSection][catagory]));
          if (items.length < parameter){
            continue;
          }

          section = tempSection;

          //console.log(items[parameter-1])
          parameter = items[parameter-1];
          break;
        }
      }
    }else{
      var section = null;
      for (let tempSection of Object.keys(data.econ.inventory[id].items)){
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          if (data.econ.inventory[id].items[tempSection][catagory][parameter] != null){
            section = tempSection;
            break;
          }
        }
      }
    }

    try{
      if (data.econ.inventory[id].items[section][catagory][parameter].total > 0){
        if (catagory != "music"){
          // do something
          var value = defaultEcon.items[section][catagory][parameter].value;
          message.channel.send(value).catch();
        }else{
          // upload the music file
          message.channel.send("", {files: [defaultEcon.items[section][catagory][parameter].value]}).catch();
        }
        return;
    }
    }catch{message.channel.send("Invalid input").catch();return;}
    

    /*for (let tempSection of Object.keys(data.econ.inventory[id].items)){
      if (data.econ.inventory[id].items[tempSection][catagory] != null){
        if (data.econ.inventory[id].items[tempSection][catagory][parameter] != null){
          if (data.econ.inventory[id].items[tempSection][catagory][parameter].total > 0){
            if (catagory != "music"){
              // do something
              var value = defaultEcon.items[tempSection][catagory][parameter].value;
              message.channel.send(value).catch();
            }else{
              // upload the music file
              message.channel.send("", {files: [defaultEcon.items[tempSection][catagory][parameter].value]}).catch();
            }
            return;
          }
        }
      }
    }*/

    message.channel.send("Invalid input").catch();
  },

  backpack(message, Discord, client){ // wallet
    // get the content and parameter the person input
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = general.getId(message, client);

    var catagory = null;
    var section = null;

    var seperator = null

    if (content.includes("#")){seperator = "#"}
    else if (content.includes('"')){seperator = '"'}
    
    if (seperator == null){
      catagory = content.trim();
    }else{
      catagory = content.substring(0,content.indexOf(seperator)).trim();

      section = content.substring(content.indexOf(seperator)+1)

      if (seperator == '"'){
        section = section.substring(0,section.indexOf('"'));
      }

      section =  section.trim();
    }
    
    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json");

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {}
    }
    if (data.econ.inventory[id].items == null){
      data.econ.inventory[id].items = {};
    }

    var showcase = "";
    var index = 0;
    for (let tempSection of Object.keys(defaultEcon.items)){
      if (data.econ.inventory[id].items[tempSection] == null){continue;}
      if (data.econ.inventory[id].items[tempSection][catagory] == null){continue;}
      var items = Object.keys(data.econ.inventory[id].items[tempSection][catagory])
      if (section != null && section != tempSection){
        index += items.length;
        continue;
      }
      showcase += "\n\n" + tempSection.toUpperCase() + ":";
      for (let item of items){
        index++;
        showcase += "\n" + index + ". " + item + ": " + data.econ.inventory[id].items[tempSection][catagory][item].total;
      }
    }

    /*if (section == null){
      for (let section of Object.keys(defaultEcon.items)){
        if (data.econ.inventory[id].items[section] == null){continue;}
        //console.log(data.econ.inventory[id].items[section][catagory])
        if (data.econ.inventory[id].items[section][catagory] == null){continue;}

        showcase += "\n\n" + section.toUpperCase() + ":";
        let items = Object.keys(data.econ.inventory[id].items[section][catagory])
        for (let i=0; i<items.length; i++){
          showcase += "\n" + (i+1).toString() + ". " + items[i] + ": " + data.econ.inventory[id].items[section][catagory][items[i]].total.toString();
        }
      }
    }else if (data.econ.inventory[id].items[section] != null && data.econ.inventory[id].items[section][catagory] != null){
      showcase += "\n\n" + section.toUpperCase() + ":";
      let items = Object.keys(data.econ.inventory[id].items[section][catagory])
      for (let i=0; i<items.length; i++){
        showcase += "\n" + (i+1).toString() + ". " + items[i] + ": " + data.econ.inventory[id].items[section][catagory][items[i]].total.toString();
      }
    }*/

    if (showcase == ""){
      message.channel.send("Invalid input").catch();
      return;
    }
    message.channel.send(showcase).catch();    
  },

  store(message, args){
    // get the content and parameter the person input
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var catagory = null;
    var section = null;

    var seperator = null

    if (content.includes("#")){seperator = "#"}
    else if (content.includes('"')){seperator = '"'}
    
    if (seperator == null){
      catagory = content.trim();
    }else{
      catagory = content.substring(0,content.indexOf(seperator)).trim();

      section = content.substring(content.indexOf(seperator)+1)

      if (seperator == '"'){
        section = section.substring(0,section.indexOf('"'));
      }

      section =  section.trim();
    }
    
    let defaultEcon = general.readFile("JSONFiles/econDefault.json");
    let data = general.readFile();
    var serverId = message.guild.id;

    function show(section, item){
      switch (section){
        case 'farm':
          // price {available: , next Yield in}
          var price = defaultEcon.items[section][catagory][item].price;

          data = module.exports.checkTime(data, defaultEcon.items[section][catagory][item], section, catagory, item, serverId)

          var available = data.econ.servers[serverId].items[section][catagory][item].total;

          var timeTillReset = defaultEcon.items[section][catagory][item].timeTillReset - Math.round(new Date().getTime()/1000 - data.econ.servers[serverId].items[section][catagory][item].lastReset);
          
          if (available == defaultEcon.items[section][catagory][item].maxCrop){
            timeTillReset = 0;
          }

          return defaultEcon.items[section][catagory][item].price + " {available: "  + available + ", reset: " + general.convertTime(timeTillReset) + "s}";
        case 'mythic':
          
          try{ // bad code practice, fix later
          var available = defaultEcon.items[section][catagory][item].maxPerServer -  data.econ.servers[serverId].items[section][catagory][item].total
          }catch{
            var available = defaultEcon.items[section][catagory][item].maxPerServer;
          }

          return defaultEcon.items[section][catagory][item].price + " {available: " + available + "}";
        case 'universal':
          var available = defaultEcon.items[section][catagory][item].max;
          if (data.econ.universal[catagory] != null && data.econ.universal[catagory][item] != null){
            available -= data.econ.universal[catagory][item].total;
          }

          return defaultEcon.items[section][catagory][item].price + " {available: " + available + "}";
        default:
          return defaultEcon.items[section][catagory][item].price;
      }
      return "";
    }

    var showcase = "";
    var index = 0;
    for (let tempSection of Object.keys(defaultEcon.items)){
      if (tempSection == "VIP"){continue;}
      if (defaultEcon.items[tempSection][catagory] == null){continue;}
      var items = Object.keys(defaultEcon.items[tempSection][catagory])
      if (section != null && section != tempSection){
        index += items.length;
        continue;
      }
      showcase += "\n\n" + tempSection.toUpperCase() + ":";
      for (let item of items){
        index++;
        showcase += "\n" + index + ". " + item + ": " + show(tempSection, item);
      }
    }

    /*if (section == null){
      for (let section of Object.keys(defaultEcon.items)){
        if (defaultEcon.items[section][catagory] == null){continue;}
        showcase += "\n\n" + section.toUpperCase() + ":";
        let items = Object.keys(defaultEcon.items[section][catagory])
        for (let i=0; i<items.length; i++){
          showcase += "\n" + (i+1).toString() + ". " + items[i] + ": " + show(section, items[i]);
        }
      }
    }else{
      showcase += "\n\n" + section.toUpperCase() + ":";
      let items = Object.keys(defaultEcon.items[section][catagory])
      for (let i=0; i<items.length; i++){
        showcase += "\n" + (i+1).toString() + ". " + items[i] + ": " + show(section, items[i]);
      }
    }*/

    if (showcase == ""){
      message.channel.send("Invalid input").catch();
      return;
    }
    message.channel.send(showcase).catch();
  },

  auction(message, client){
    var money = 500;

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json")
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var newValue = (money, name) => {
      switch (name){
        case '1️⃣':
          return money + money*.1
        case '2️⃣':
          return money + money*.2;
        case '3️⃣':
          return money + money*.3;
        case '4️⃣':
          return money + money * .4;
        case '5️⃣':
          return money + money * .5;
        case '6️⃣':
          return money + money * .6;
        case '7️⃣':
          return money + money * .7;
        case '8️⃣':
          return money + money * .8;
        case '9️⃣':
          return money + money * .9;
        case '🔟':
          return money + money;
        default:
          console.log(name)
          return null;
      }
    }

    var catagory = null;
    var parameter = null;
    var money = null;

    var seperator = null

    if (content.includes("#")){seperator = "#"}
    else if (content.includes('"')){seperator = '"'}
    
    if (seperator == null){
      message.channel.send("Invalid input").catch();
      return;
    }else{
      catagory = content.substring(0,content.indexOf(seperator)).trim();

      parameter = content.substring(content.indexOf(seperator)+1)

      if (parameter.indexOf("$") != -1){
        money = parameter.substring(parameter.indexOf("$")+1).trim();
        parameter = parameter.substring(0, parameter.indexOf("$") + 1).trim()
      }

      if (seperator == '"'){
        parameter = parameter.substring(0,parameter.indexOf('"'));
      }

      parameter =  parameter.trim();
    }

     var item = null;
    var section = null;
    if (!isNaN(parameter)){ // is a number
      var index = 0;
      let items = []
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (data.econ.inventory[id].items[tempSection] == null){continue;}
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          items = items.concat(Object.keys(data.econ.inventory[id].items[tempSection][catagory]));
          if (items.length < parameter){
            continue;
          }

          section = tempSection;

          //console.log(items[parameter-1])
          parameter = items[parameter-1];
          break;
        }
      }
    }else{
      var section = null;
      for (let tempSection of Object.keys(data.econ.inventory[id].items)){
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          if (data.econ.inventory[id].items[tempSection][catagory][parameter] != null){
            section = tempSection;
            break;
          }
        }
      }
    }

    if (section == null){
      message.channel.send("Could not find item").catch();
      return;
    }
    item = data.econ.inventory[id].items[section][catagory][parameter]
    if (item.total <= 0){
      message.channel.send("You dont have any to give").catch();
      return;
    }

    if (money == null){
      money = defaultEcon.items[section][catagory][parameter].price;
    }

    money = parseInt(money)

    message.channel.send("Will the auction start").catch().then((botMessage) => {
      botMessage.react('👍');
      var highBid = null;


      // Set a filter to ONLY grab those reactions & discard the reactions from the bot
      const filter = (reaction, user) => {
        //console.log(user.id)
        //console.log(pinged.id)
        return /*reaction.emoji.name === '👍'*/user.id != "894043486637137961";
      };
    
      // Create the collector
      const collector = botMessage.createReactionCollector(filter, {
        time: 300000
      });

      collector.on('collect', (reaction, user) => {
        if (user.id == message.author.id && reaction.emoji.name == "❌"){
          collector.stop();
          return;
        }

        if (user.id == message.author.id){
          return;
        }

        if (data.stats.personal[user.id] == null){
          botMessage.reactions.resolve(reaction.emoji.name).users.remove(user.id);
          return;
        }

        if (data.stats.personal[user.id].zeros < money){
          botMessage.reactions.resolve(reaction.emoji.name).users.remove(user.id);
          return;
        }

        if (highBid == null){
          if (reaction.emoji.name == "👍"){
            // add money check before this

            highBid = user.id
            botMessage.reactions.resolve(reaction.emoji.name).users.remove(user.id);
            botMessage.reactions.resolve(reaction.emoji.name).users.remove("894043486637137961");

            botMessage.edit("Bid now open\nHighest Bidder: " + client.users.cache.get(highBid).username + "\nValue: " + money)

            botMessage.react('1️⃣');
            botMessage.react('2️⃣');
            botMessage.react('3️⃣');
            botMessage.react('4️⃣');
            botMessage.react('5️⃣');
            botMessage.react('6️⃣');
            botMessage.react('7️⃣');
            botMessage.react('8️⃣');
            botMessage.react('9️⃣');
            botMessage.react('🔟');
            botMessage.react('❌');

            return;        
          }
        }

        if (reaction.emoji.name == "❌"){
          return;
        }

        botMessage.reactions.resolve(reaction.emoji.name).users.remove(user.id);

        var tempMoney = Math.round(newValue(money, reaction.emoji.name));
        if (data.stats.personal[user.id].zeros >= tempMoney){
          highBid = user.id;
          money = tempMoney;
          botMessage.edit("Bid now open\nHighest Bidder: " + client.users.cache.get(highBid).username + "\nValue: " + money)
        }

      })


      collector.on('end', () => {
        if (highBid == null){
          botMessage.edit("Bid is now over");
          return;
        }

        // check if the item is still availble
        item = data.econ.inventory[id].items[section][catagory][parameter]
        if (item.total <= 0){
          botMessage.edit("You dont have any to give").catch();
          return;
        }

        if (data.stats.personal[highBid].zeros < money){
          botMessage.edit("You can no longer afford this item");
          return;
        }

        botMessage.edit(client.users.cache.get(highBid).username + " won the bid for $" + money);

        if (data.econ.inventory[highBid] == null){
          data.econ.inventory[highBid] = {items: {}} 
        }
        if (data.econ.inventory[highBid].items[section] == null){
          data.econ.inventory[highBid].items[section] = {}
        }
        if (data.econ.inventory[highBid].items[section][catagory] == null){
          data.econ.inventory[highBid].items[section][catagory] = {}
        }
        if (data.econ.inventory[highBid].items[section][catagory][parameter] == null){
          data.econ.inventory[highBid].items[section][catagory][parameter] = {total:0}
        }

        data.econ.inventory[id].items[section][catagory][parameter].total--;
        data.econ.inventory[highBid].items[section][catagory][parameter].total++;

        data.stats.personal[id].zeros += money;
        data.stats.personal[highBid].zeros -= money;

        data.econ.inventory[highBid].spent += money;

        general.writeFile(data);
      }) 
    })
  },

  trade(message, args){
    // 0trade @thatonedoge image "hello" $500
    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var catagory = null;
    var section = null;
    var pinged = message.mentions.users.first();
    var money = null;

    if (pinged){
      content = message.content.substring(message.content.indexOf(">") + 1);
    }

    var seperator = null

    if (content.includes("#")){seperator = "#"}
    else if (content.includes('"')){seperator = '"'}
    
    if (seperator == null){
      message.channel.send("Invalid input").catch();
      return;
    }else{
      catagory = content.substring(0,content.indexOf(seperator)).trim();

      parameter = content.substring(content.indexOf(seperator)+1)

      if (parameter.indexOf("$") != -1){
        money = parameter.substring(parameter.indexOf("$")+1).trim();
        parameter = parameter.substring(0, parameter.indexOf("$") + 1).trim()
      }

      if (seperator == '"'){
        parameter = parameter.substring(0,parameter.indexOf('"'));
      }

      parameter =  parameter.trim();
    }

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json")
    
    var item = null;
    var section = null;
    if (!isNaN(parameter)){ // is a number
      var index = 0;
      let items = []
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (data.econ.inventory[id].items[tempSection] == null){continue;}
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          items = items.concat(Object.keys(data.econ.inventory[id].items[tempSection][catagory]));
          if (items.length < parameter){
            continue;
          }

          section = tempSection;

          //console.log(items[parameter-1])
          parameter = items[parameter-1];
          break;
        }
      }
    }else{
      var section = null;
      for (let tempSection of Object.keys(data.econ.inventory[id].items)){
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          if (data.econ.inventory[id].items[tempSection][catagory][parameter] != null){
            section = tempSection;
            break;
          }
        }
      }
    }

    if (section == null){
      message.channel.send("Could not find item").catch();
      return;
    }
    item = data.econ.inventory[id].items[section][catagory][parameter]
    if (item.total <= 0){
      message.channel.send("You dont have any to give").catch();
      return;
    }

    if (money == null){
      money = defaultEcon.items[section][catagory][parameter].price;
    }

    money = parseInt(money)

    var messageToSend = pinged != null ? "<@!" + pinged.id + "> would you like to buy this item for $" + money: message.author.username + " is selling this item for $" + money; 
    message.channel.send(messageToSend).catch().then((botMessage) => {
      botMessage.react('👍');
      var reason = "Sale has come to and end";

      // Set a filter to ONLY grab those reactions & discard the reactions from the bot
      const filter = (reaction, user) => {
        //console.log(user.id)
        //console.log(pinged.id)
        return reaction.emoji.name === '👍' && user.id != "894043486637137961" && user.id != message.author.id;
      };
    
      // Create the collector
      const collector = botMessage.createReactionCollector(filter, {
        time: 300000
      });

      collector.on('collect', (reaction, user) => {
        if (data.econ.inventory[id].items[section][catagory][parameter].total <= 0){
          reason = "No more items available";
          collector.stop();
        }

        if (pinged != null){
          if (pinged.id != user.id){
            return;
          }
        }

        //console.log(money)
        //console.log(data.stats.personal[user.id].zeros);
        if (data.stats.personal[user.id].zeros >= money){
          
          data.econ.inventory[id].items[section][catagory][parameter].total--;

          if (data.econ.inventory[user.id] == null){
            data.econ.inventory[user.id] = {items: {}} 
          }
          if (data.econ.inventory[user.id].items[section] == null){
            data.econ.inventory[user.id].items[section] = {}
          }
          if (data.econ.inventory[user.id].items[section][catagory] == null){
            data.econ.inventory[user.id].items[section][catagory] = {}
          }
          if (data.econ.inventory[user.id].items[section][catagory][parameter] == null)
          {
            data.econ.inventory[user.id].items[section][catagory][parameter] = {total:0}
          }

          data.econ.inventory[user.id].items[section][catagory][parameter].total++;

          data.stats.personal[user.id].zeros -= money;
          data.stats.personal[id].zeros += money;

          data.econ.inventory[user.id].spent += money;

          general.writeFile(data);
          reason = "Purchase was made by " + user.username + " for " + money + " bits";
          collector.stop();
        }
      });

      collector.on('end', () =>{
        botMessage.edit(reason);
      })
    
    });

  },

  give(message, args){
    // 0give image "hello" @thatonedoge
    // 0give @thatOneDoge image "hello"

    var content = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;

    var catagory = null;
    var section = null;
    var pinged = message.mentions.users.first();
    
    if (pinged == null){
      message.channel.send("Invalid input").catch();
      return;
    }

    content = message.content.substring(message.content.indexOf(">") + 1);

    var seperator = null

    if (content.includes("#")){seperator = "#"}
    else if (content.includes('"')){seperator = '"'}
    
    if (seperator == null){
      message.channel.send("Invalid input").catch();
      return;
    }else{
      catagory = content.substring(0,content.indexOf(seperator)).trim();

      parameter = content.substring(content.indexOf(seperator)+1)

      if (seperator == '"'){
        parameter = parameter.substring(0,parameter.indexOf('"'));
      }

      parameter =  parameter.trim();
    }

    //message.channel.send("catagory " + catagory + " parameter " + parameter + " id " + pinged.id).catch();

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json")
    
    var item = null;
    var section = null;
    if (!isNaN(parameter)){ // is a number
      var index = 0;
      let items = []
      for (let tempSection of Object.keys(defaultEcon.items)){
        if (data.econ.inventory[id].items[tempSection] == null){continue;}
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          items = items.concat(Object.keys(data.econ.inventory[id].items[tempSection][catagory]));
          if (items.length < parameter){
            continue;
          }

          section = tempSection;

          //console.log(items[parameter-1])
          parameter = items[parameter-1];
          break;
        }
      }
    }else{
      var section = null;
      for (let tempSection of Object.keys(data.econ.inventory[id].items)){
        if (data.econ.inventory[id].items[tempSection][catagory] != null){
          if (data.econ.inventory[id].items[tempSection][catagory][parameter] != null){
            section = tempSection;
            break;
          }
        }
      }
    }

    if (section == null){
      message.channel.send("Could not find item").catch();
      return;
    }
    item = data.econ.inventory[id].items[section][catagory][parameter]
    if (item.total <= 0){
      message.channel.send("You dont have any to give").catch();
      return;
    }

    if (data.econ.inventory[pinged.id] == null){
      data.econ.inventory[pinged.id] = {items: {}};
    }
    if (data.econ.inventory[pinged.id].items[section] == null){
      data.econ.inventory[pinged.id].items[section] = {};
    }
    if (data.econ.inventory[pinged.id].items[section][catagory] == null){
      data.econ.inventory[pinged.id].items[section][catagory] = {};
    }
    if (data.econ.inventory[pinged.id].items[section][catagory][parameter] == null){
      data.econ.inventory[pinged.id].items[section][catagory][parameter] = {total: 0};
    }

    data.econ.inventory[pinged.id].items[section][catagory][parameter].total++;
    data.econ.inventory[id].items[section][catagory][parameter].total--;

    message.channel.send("Sharing truly is caring").catch();

    general.writeFile(data);
  }
  
}