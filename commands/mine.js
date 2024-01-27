const general = require('./general');
const hack = require('./hacks');

module.exports = {
  name: "mine",
  description: "Holds commands so that people can mine for bits",

  getPrice(level){
    var price = 0;

    if (level == 0){
      price = 50;
    }else if (level == 1){
      price = 100;
    }else{
      if (level >= 5){
        price = Math.pow(10, 5)+100;
      }
      level *= 1000;
      price +=  Math.round(Math.log(level) * (level));
    }

    return price;
  },

  getMaxLevel(upgrade){
    switch (upgrade){
      case 'oven':
        return 6;
      case 'workers':
        return 9;
      case 'ingredients':
        return 9
      default:
        return 6;
    }
  },

  getCookieShop(id){
    let shop = general.readFile("JSONFiles/cookieShops.json");

    if (shop.shops[id] == null){
      shop.shops[id] = {
        ingredients: {
          price: 100,
          level: 1
        },
        oven: {
          price: 100,
          level: 1
        },
        ads: {
          price: 100,
          level: 1
        },
        shop: {
          price: 100,
          level: 1
        },
        magic: {
          price: 100,
          level: 1
        },
        workers: {
          price: 100,
          level: 1
        },
        "morning bagel": {
          price: 100,
          level: 1
        },
        "grandma's knowledge": {
          price: 100,
          level: 1
        },
        smile: {
          price: 100,
          level: 1
        },
        cooks: {}
      }
    }

    // if anything else add here
    if (shop.shops[id].schedule == null){
      shop.shops[id].schedule = {level: 1}
    }

    if (shop.shops[id]["science team"] == null){
      shop.shops[id]["science team"] = {level: 1}
    }

    if (shop.shops[id].cooks.brewery == null){
      shop.shops[id].cooks.brewery = {};
    }

    if (shop.shops[id].factory == null){
      shop.shops[id].factory = {level: 1}
      shop.shops[id].website = {level: 0}
      shop.shops[id].trucks = {level: 1}
    }

    if (shop.shops[id].investors == null){
      shop.shops[id].investors = {level: 1};
    }

    if (shop.shops[id].wisdom == null){
      shop.shops[id].wisdom = {level: 0}
      shop.shops[id]["research team"] = {level: 1}
      shop.shops[id]["quality assurance"] = {level: 1}
      shop.shops[id].rituals = {level: 1}
      shop.shops[id]['engineering team'] = {level: 1}
    }

    if (shop.shops[id].passive == null){
      shop.shops[id].passive = {
        lastCheck: new Date().getTime() / 1000
      }
    }

    return shop;
  },

  getCookies(){
    return general.readFile("JSONFiles/cookies.json");
  },

  passiveBake(cookieShops, id, cookies){
    if (cookieShops.shops[id].website.level == 0){
      return cookieShops;
    }

    var hacks = hack.getHacks(id);
    var hackDefault = hack.getDefault();

    var time = 1800;

    if (hacks.users[id]["time"]["passive_runner"]){
      if (hack.getTimeRemaining(hacks.users[id]["time"]["passive_runner"].startTime, hackDefault.hacks["tier1"]["passive_runner"].maxTime) > 0){
        time /= 2;
      }
    }

    var deltaTime = Math.abs(cookieShops.shops[id].passive.lastCheck - new Date().getTime() / 1000)
    if (deltaTime >= time/cookieShops.shops[id].trucks.level){
      cookieShops.shops[id].passive.lastCheck = new Date().getTime() / 1000

      var cooks = Math.floor(deltaTime/(time/cookieShops.shops[id].trucks.level))

      var tiers = Object.values(cookies.tiers);
      var options = []
      for (let i=0; i < cookieShops.shops[id].website.level; i++){
        options = options.concat(Object.values(tiers[i]));
      }

      for (var i=0; i<cooks; i++){
        for (var y=0; y<cookieShops.shops[id].factory.level; y++){
          var chance = Math.floor(Math.random()*101)+1
          var item = options[Math.floor(Math.random() * options.length)];

          if (cookieShops.shops[id].ingredients.level >= 7){
            if (item.value == "<:sugar:945767685759848489>"){
              item.rarity += 10 + cookieShops.shops[id]["research team"].level * 2;
            }
          }
          
          while (chance < 100-(item.rarity)){
            item = options[Math.floor(Math.random() * options.length)];
          }

          if (cookieShops.shops[id].cooks[item.value] == null){
            cookieShops.shops[id].cooks[item.value] = 0;
          }
          cookieShops.shops[id].cooks[item.value]++;
        }
      }
    }

    return cookieShops;
  },

  bake(message, Discord, client){
    function incrementStats(shop, add=true){
      var num = add ? 1: -1
      shop.oven.level += num;
      shop.ads.level += num;
      shop.shop.level += num;
      shop["grandma's knowledge"].level += num;
      shop.magic.level += num;
      shop.smile.level += num;

      return shop
    }

    var cookies = module.exports.getCookies();
    var cookieShops = module.exports.getCookieShop(message.author.id);
    var data = general.readFile();
    var hacks = hack.getHacks(message.author.id)

    var id = message.author.id;
    var bakeAll = message.content.substring(message.content.indexOf(" ") + 1).trim().toLowerCase() == "all";

    if (cookieShops.shops[id].cooks.totalCooks == null){
      cookieShops.shops[id].cooks.totalCooks = 1;
      cookieShops.shops[id].cooks.lastReset = new Date().getTime() / 1000;
    }

    var deltaTime = Math.abs(new Date() / 1000 - cookieShops.shops[id].cooks.lastReset);

    var cooksEarned = 1800 - (1800 * (cookieShops.shops[id].schedule.level/10))

    if (deltaTime > cooksEarned){
      cookieShops.shops[id].cooks.lastReset = new Date().getTime() / 1000;
      //cookieShops.shops[id].cooks.totalCooks = 5 + cookieShops.shops[id].workers.level;

      cooksEarned = Math.floor(deltaTime/cooksEarned);
      cookieShops.shops[id].cooks.totalCooks += cooksEarned;
      if (cookieShops.shops[id].cooks.totalCooks > cookieShops.shops[id].workers.level){
        cookieShops.shops[id].cooks.totalCooks = cookieShops.shops[id].workers.level
      }
    }else{
      if (cookieShops.shops[id].cooks.totalCooks <= 0){
        message.channel.send("You have run out of bakes, please come back in " + general.convertTime(Math.round(cooksEarned - deltaTime))).catch();
        return;
      }
    }

    var hard_workers = hacks.users[id].item.hard_worker && hacks.users[id].item.hard_worker.total > 0;

    if (hard_workers === true){
      // do the fancy stuff
      cookieShops.shops[id] = incrementStats(cookieShops.shops[id], true)
    }

    //cookieShops.shops[id].cooks.totalCooks = 5 + cookieShops.shops[id].workers.level;

    var cooks = [];
    var tiers = Object.values(cookies.tiers);
    var options = []
    for (let i=0; i < cookieShops.shops[id].ingredients.level && i < tiers.length; i++){
      options = options.concat(Object.values(tiers[i]));
    }

    
    var cookTimes = bakeAll ? cookieShops.shops[id].cooks.totalCooks: 1;
    for (var z = 0; z < cookTimes; z++){
      var orders = Math.floor(Math.random() * 11 * cookieShops.shops[id].ads.level) + 1;
      data.stats.personal[id].zeros += orders;
      data.stats.global.bot.bits.total += orders;
      
      var showcase = "Orders: " + orders + " bits";
      for (let i=0; i < cookieShops.shops[id].oven.level; i++){
        showcase += "\n";
        var chance = Math.floor(Math.random()*101)+1
        var item = options[Math.floor(Math.random() * options.length)];
  
        while (chance < 100-(item.rarity+cookieShops.shops[id]["grandma's knowledge"].level * 2)){
          item = options[Math.floor(Math.random() * options.length)];
        }
        
        var amount = 0;

        var x = Math.abs((Math.floor(Math.random() * 101) + 1)-100);
        amount = Math.round(item.max * Math.pow(1.05, -x))
  
        if (Math.floor(Math.random()*101)+1 <= cookieShops.shops[id].magic.level * 2){
          amount *= 2;
        }
  
        //var x = Math.abs((Math.floor(Math.random() * 101) + 1)-100);
        //var amount = Math.round(item.max * Math.pow(1.05, -x))
        if (amount == 0){
          amount = 1;
        }
  
        //if (chance <= cookieShops.shops[id].magic.level * 2){
          //amount *= 2;
        //}
  
        //console.log(item)
        showcase += item.value + ' => ' + amount
        if (cookieShops.shops[id].cooks[item.value] == null){
          cookieShops.shops[id].cooks[item.value] = 0;
        }
        cookieShops.shops[id].cooks[item.value] += amount;

        if (data.stats.personal[id].bakery == null){
          data.stats.personal[id].bakery = {}
        }
        if (data.stats.personal[id].bakery.bakes == null){
          data.stats.personal[id].bakery.bakes = {
            cooks: 0,
            total: 0,
            top: [],
            cookies: {}
          }
        }

        data.stats.personal[id].bakery.bakes.total += amount;

        if (data.stats.personal[id].bakery.bakes.cookies[item.value] == null){
          data.stats.personal[id].bakery.bakes.cookies[item.value] = 0;
        }
        data.stats.personal[id].bakery.bakes.cookies[item.value] += amount;

        data.stats.personal[id].bakery.bakes.top = general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies[item.value]}, null)
      }

      data.stats.personal[id].bakery.bakes.cooks++;

      var tip = Math.floor(Math.random() * 101) + 1;
      if (tip < cookieShops.shops[id].smile.level * 2+2){
        showcase += "\nTipped a <:chest:934664711436374116>";
        if (cookieShops.shops[id].cooks["<:chest:934664711436374116>"] == null){
          cookieShops.shops[id].cooks["<:chest:934664711436374116>"] = 0;
        }
        cookieShops.shops[id].cooks["<:chest:934664711436374116>"]++;

        if (data.stats.personal[id].bakery.bakes.cookies["<:chest:934664711436374116>"] == null){
          data.stats.personal[id].bakery.bakes.cookies["<:chest:934664711436374116>"] = 0;
        }
        data.stats.personal[id].bakery.bakes.cookies["<:chest:934664711436374116>"]++;

        data.stats.personal[id].bakery.bakes.top =   general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies["<:chest:934664711436374116>"]}, null)
      }

      if (cookieShops.shops[id].ingredients.level >= 7){
        //<:flour:945767684509945947>
        var chance = Math.floor(Math.random() * 101) + 1;
        //chance = 1;
        if (chance < cookieShops.shops[id].wisdom.level * 2+5){
          showcase += "\nTipped a <:flour:945767684509945947>";
        if (cookieShops.shops[id].cooks["<:flour:945767684509945947>"] == null){
          cookieShops.shops[id].cooks["<:flour:945767684509945947>"] = 0;
        }
        cookieShops.shops[id].cooks["<:flour:945767684509945947>"]++;

        if (data.stats.personal[id].bakery.bakes.cookies["<:flour:945767684509945947>"] == null){
          data.stats.personal[id].bakery.bakes.cookies["<:flour:945767684509945947>"] = 0;
        }
        data.stats.personal[id].bakery.bakes.cookies["<:flour:945767684509945947>"]++;

        data.stats.personal[id].bakery.bakes.top =   general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies["<:flour:945767684509945947>"]}, null)
        }
      }

      if (cookieShops.shops[id].ingredients.level >= 9){
        var chance = Math.floor(Math.random() * 101) + 1;
        if (chance < cookieShops.shops[id].wisdom.level * 2+5){
          showcase += "\nTipped a :drop_of_blood:";
        if (cookieShops.shops[id].cooks[":drop_of_blood:"] == null){
          cookieShops.shops[id].cooks[":drop_of_blood:"] = 0;
        }
        cookieShops.shops[id].cooks[":drop_of_blood:"]++;

        if (data.stats.personal[id].bakery.bakes.cookies[":drop_of_blood:"] == null){
          data.stats.personal[id].bakery.bakes.cookies[":drop_of_blood:"] = 0;
        }
        data.stats.personal[id].bakery.bakes.cookies[":drop_of_blood:"]++;

        data.stats.personal[id].bakery.bakes.top =   general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies[":drop_of_blood:"]}, null)
        }
      }

      if (hard_workers === true){
        hacks.users[id].item.hard_worker.total--;
        if (hacks.users[id].item.hard_worker.total <= 0){
          hard_worker = false
          cookieShops.shops[id] = incrementStats(cookieShops.shops[id], false)
        }
      }
  
      cooks.push(showcase);
    }
    
    if (bakeAll){
      cookieShops.shops[id].cooks.totalCooks = 0;
    }
    else{
      cookieShops.shops[id].cooks.totalCooks--;
    }

    let self = general.embedInfo(id, client)

     embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    for (var i=0; i<cooks.length; i++){
      embed.addField("Oven: ", cooks[i], true)
    }
    
    if (hard_workers === true){
      // do the fancy stuff
      cookieShops.shops[id] = incrementStats(cookieShops.shops[id], false)
    }
    
    general.writeFile(cookieShops, 'JSONFiles/cookieShops.json');
    general.writeFile(hacks, "JSONFiles/hacks.json")
    general.writeFile(data);
    message.channel.send(embed).catch();
  },

  testBake(message, Discord, client){
    function incrementStats(shop, add=true){
      var num = add ? 1: -1
      shop.oven.level += num;
      shop.ads.level += num;
      shop.shop.level += num;
      shop["grandma's knowledge"].level += num;
      shop.magic.level += num;
      shop.smile.level += num;

      return shop
    }

    var cookies = module.exports.getCookies();
    var cookieShops = module.exports.getCookieShop(message.author.id);
    var data = general.readFile();
    var hacks = hack.getHacks(message.author.id)

    var id = message.author.id;
    var bakeAll = message.content.substring(message.content.indexOf(" ") + 1).trim().toLowerCase() == "all";

    if (cookieShops.shops[id].cooks.totalCooks == null){
      cookieShops.shops[id].cooks.totalCooks = 5;
      cookieShops.shops[id].cooks.lastReset = new Date().getTime() / 1000;
    }

    var deltaTime = Math.abs(new Date() / 1000 - cookieShops.shops[id].cooks.lastReset);

    /*if (deltaTime > 3600){
      cookieShops.shops[id].cooks.lastReset = new Date().getTime() / 1000;
      cookieShops.shops[id].cooks.totalCooks = 5 + cookieShops.shops[id].workers.level;
    }else{
      if (cookieShops.shops[id].cooks.totalCooks <= 0){
        message.channel.send("You have run out of bakes, please come back in " + general.convertTime(Math.round(3600 - deltaTime))).catch();
        return;
      }
    }*/

    var hard_workers = hacks.users[id].item.hard_worker && hacks.users[id].item.hard_worker.total > 0;

    /*if (hard_workers){
      // do the fancy stuff
      cookieShops.shops[id] = incrementStats(cookieShops.shops[id], true)
    }*/

    //cookieShops.shops[id].cooks.totalCooks = 5 + cookieShops.shops[id].workers.level;

    var cooks = [];
    var totals = {};
    var tiers = Object.values(cookies.tiers);
    var options = []
    for (let i=0; i < cookieShops.shops[id].ingredients.level && i < tiers.length; i++){
      options = options.concat(Object.values(tiers[i]));
    }

    
    var cookTimes = bakeAll ? 6: 1
    for (var z = 0; z < cookTimes; z++){
      var orders = Math.floor(Math.random() * 11 * cookieShops.shops[id].ads.level) + 1;
      data.stats.personal[id].zeros += orders;
      data.stats.global.bot.bits.total += orders;
      
      var showcase = "Orders: " + orders + " bits";
      for (let i=0; i < cookieShops.shops[id].oven.level; i++){
        showcase += "\n";
        var chance = Math.floor(Math.random()*101)+1
        var item = options[Math.floor(Math.random() * options.length)];
  
        while (chance < 100-(item.rarity+cookieShops.shops[id]["grandma's knowledge"].level * 2)){
          item = options[Math.floor(Math.random() * options.length)];
        }
        
        var amount = 0;

        var x = Math.abs((Math.floor(Math.random() * 101) + 1)-100);
        amount = Math.round(item.max * Math.pow(1.05, -x))
  
        if (Math.floor(Math.random()*101)+1 <= cookieShops.shops[id].magic.level * 2){
          amount *= 2;
        }
  
        //var x = Math.abs((Math.floor(Math.random() * 101) + 1)-100);
        //var amount = Math.round(item.max * Math.pow(1.05, -x))
        if (amount == 0){
          amount = 1;
        }
  
        //if (chance <= cookieShops.shops[id].magic.level * 2){
          //amount *= 2;
        //}
  
        //console.log(item)
        showcase += item.value + ' => ' + amount

        if (totals[item.value] == null){
          totals[item.value] = 0;
        }
        totals[item.value] += amount;
        
        if (cookieShops.shops[id].cooks[item.value] == null){
          cookieShops.shops[id].cooks[item.value] = 0;
        }
        cookieShops.shops[id].cooks[item.value] += amount;
      }
  
      
      var tip = Math.floor(Math.random() * 101) + 1;
      if (tip < cookieShops.shops[id].smile.level * 2+2){
        showcase += "\nTipped a <:chest:934664711436374116>";

        if (totals["<:chest:934664711436374116>"] == null){
          totals["<:chest:934664711436374116>"] = 0
        }
        totals["<:chest:934664711436374116>"]++
        
        if (cookieShops.shops[id].cooks["<:chest:934664711436374116>"] == null){
          cookieShops.shops[id].cooks["<:chest:934664711436374116>"] = 0;
        }
        cookieShops.shops[id].cooks["<:chest:934664711436374116>"]++;
      }

      /*if (hard_workers){
        hacks.users[id].item.hard_worker.total--;
        if (hacks.users[id].item.hard_worker.total <= 0){
          hard_worker = false
          cookieShops.shops[id] = incrementStats(cookieShops.shops[id], false)
        }
      }*/
  
      cooks.push(showcase);
    }
    
    if (bakeAll){
      cookieShops.shops[id].cooks.totalCooks = 0;
    }
    else{
      cookieShops.shops[id].cooks.totalCooks--;
    }

    let self = general.embedInfo(id, client)

     embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    for (var i=0; i<cooks.length; i++){
      embed.addField("Oven: ", cooks[i], true)
    }

    var everything = "";
    for (let item of Object.keys(totals)){
      everything += "\n" + item + " => " + totals[item]
    }
    embed.addField("Total: ", everything, true)
    
    /*if (hard_workers){
      // do the fancy stuff
      cookieShops.shops[id] = incrementStats(cookieShops.shops[id], false)
    }*/
    
    //general.writeFile(cookieShops, 'JSONFiles/cookieShops.json');
    //general.writeFile(hacks, "JSONFiles/hacks.json")
    //general.writeFile(data);
    message.channel.send(embed).catch();
  },

  sell(message, args){
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
    let cookieShops = module.exports.getCookieShop(id);
    var cookies = module.exports.getCookies();

    cookieShops = module.exports.passiveBake(cookieShops, id, cookies);

    var item = catagory.toLowerCase();
    var amount = parameter.toLowerCase();

    if (item == "" && message.content.toLowerCase().includes("all")){
      var earned = 0;
      for (let tier of Object.keys(cookies.tiers)){
        for (let item of Object.values(cookies.tiers[tier])){
          if (item.name == "chest" || item.name == "sugar" || item.name == "flour" || item.name == "flask" || item.name == "blood" || item.name == "soul" || item.name == "love"){
            continue;
          }

          if (cookieShops.shops[id].cooks[item.value] == null || cookieShops.shops[id].cooks[item.value] == 0){
            continue;
          }

          var amount = cookieShops.shops[id].cooks[item.value];
          var price = item.price;
          earned += amount * price;
          cookieShops.shops[id].cooks[item.value] = 0;
        }
      }


      earned *= cookieShops.shops[id].shop.level; // gives bonus based on shop level

      data.stats.personal[id].zeros += earned;
      data.stats.global.bot.bits.total += earned;

      if (!earned){ // stops data from you know, going bye bye
        message.channel.send("Nothing to sell here").catch();
        return;
      }

      if (cookieShops.shops[id].ingredients.level >= 8){
        var love = earned / Math.floor(50_000 / cookieShops.shops[id]["quality assurance"].level);
        love = Math.floor(love);

        if (cookieShops.shops[id].cooks[":heart:"] == null){
          cookieShops.shops[id].cooks[":heart:"] = 0;
        }
        cookieShops.shops[id].cooks[":heart:"] += love;

        if (data.stats.personal[id].bakery.bakes.cookies[":heart:"] == null){
          data.stats.personal[id].bakery.bakes.cookies[":heart:"] = 0;
        }
        data.stats.personal[id].bakery.bakes.cookies[":heart:"] += love;

        data.stats.personal[id].bakery.bakes.top =   general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies[":heart:"]}, null)        
      }
          
      general.writeFile(data);
      general.writeFile(cookieShops, "JSONFiles/cookieShops.json");

      var show = "Sold everything! Now heres your " + earned + " bits";
      if (love != null && love > 0){
        show += "\n:heart:'s collected: " + love;
      }
      
      message.channel.send(show).catch();
      return;
    }

    for (let tier of Object.keys(cookies.tiers)){
      if (cookies.tiers[tier][item] != null){
        price = cookies.tiers[tier][item].price
        item = cookies.tiers[tier][item].value;

        if (cookieShops.shops[id].cooks[item] == null){
          message.channel.send("You dont appear to have any to sell").catch();
          return;
        }

        var earned = 0;
        if (amount == "all"){
          earned = cookieShops.shops[id].cooks[item] * price;
          amount = cookieShops.shops[id].cooks[item]
        }
        else if (!isNaN(amount)){
          amount = parseInt(amount);

          if (amount > cookieShops.shops[id].cooks[item]){
            message.channel.send("You do not have that amount").catch();
            return;
          }

          earned = price * amount;
        }else{
          message.channel.send("Invalid input").catch();
          return;
        }

        cookieShops.shops[id].cooks[item] -= amount;

        earned *= cookieShops.shops[id].shop.level;

        data.stats.personal[id].zeros += earned;
        data.stats.global.bot.bits.total += earned;

        if (cookieShops.shops[id].ingredients.level >= 8){
          var love = earned / Math.floor(50_000 / cookieShops.shops[id]["quality assurance"].level);
          love = Math.floor(love);
  
          if (cookieShops.shops[id].cooks[":heart:"] == null){
            cookieShops.shops[id].cooks[":heart:"] = 0;
          }
          cookieShops.shops[id].cooks[":heart:"] += love;
  
          if (data.stats.personal[id].bakery.bakes.cookies[":heart:"] == null){
            data.stats.personal[id].bakery.bakes.cookies[":heart:"] = 0;
          }
          data.stats.personal[id].bakery.bakes.cookies[":heart:"] += love;
  
          data.stats.personal[id].bakery.bakes.top =   general.newTop(data.stats.personal[id].bakery.bakes.top, {id: item.value, total: data.stats.personal[id].bakery.bakes.cookies[":heart:"]}, null)
        }
        
        general.writeFile(data);
        general.writeFile(cookieShops, "JSONFiles/cookieShops.json");

        var show = "Sold " + item + "! Now heres your " + earned + " bits";
        if (love != null && love > 0){
          show += "\n:heart:'s collected: " + love;
        }
        
        message.channel.send(show).catch();
        return;
      }
    }
    message.channel.send("Could not find item").catch();
  },

  shop(message, Discord, client){
    var cookies = module.exports.getCookies();
    var id = general.getId(message, client);
    var cookieShops = module.exports.getCookieShop(id);

    
    var self = general.embedInfo(id, client)

    var shop = cookieShops.shops[id]

    var price = (level) => {return module.exports.getPrice(level)}
    var max = (item) => {return module.exports.getMaxLevel(item)}

    var showcase = "<:oven:934672065309605908> Oven: " + shop.oven.level + (shop.oven.level < max('oven') ? " {upgrade: " + price(shop.oven.level) + "}" : " {MAXED}");

    showcase += "\n:cookie: Ingredients: " + shop.ingredients.level + (shop.ingredients.level < max("ingredients") ? " {upgrade: " + price(shop.ingredients.level) + "}" : " {MAXED}");

    showcase += "\n:tv: Ads: " + shop.ads.level + (shop.ads.level < max('ads') ? " {upgrade: " + price(shop.ads.level) + "}": " {MAXED}");

    showcase += "\n:convenience_store: Shop: " + shop.shop.level + (shop.shop.level < max('shop') ? " {upgrade: " + price(shop.shop.level) + "}": " {MAXED}");

    showcase += "\n:cook: Workers: " + shop.workers.level + (shop.workers.level < max('workers') ? " {upgrade: " + price(shop.workers.level) + "}" : " {MAXED}");

    showcase += "\n:bagel: Morning Bagel: " + shop["morning bagel"].level + (shop['morning bagel'].level < max('morning bagel') ? " {upgrade: " + price(shop["morning bagel"].level) + "}" : " {MAXED}");

    showcase += "\n:older_woman: Grandma's Knowledge: " + shop["grandma's knowledge"].level + ( shop["grandma's knowledge"].level < max("grandma's knowledge") ? " {upgrade: " + price(shop["grandma's knowledge"].level) + "}" : " {MAXED}");

    showcase += "\n:smile: Smile: " + shop.smile.level + (shop.smile.level < max("smile") ? "{upgrade: " + price(shop.smile.level) + "}" : " {MAXED}");

    showcase += "\n:magic_wand: Magic: " + shop.magic.level + (shop.magic.level < max('magic') ? " {upgrade: " + price(shop.magic.level) + "}" : " {MAXED}");

    showcase += "\n:scroll: Schedule " + shop.schedule.level + (shop.schedule.level < max('schedule') ? " {upgrade: " + price(shop.schedule.level) + "}" : " {MAXED}");

    showcase += "\n:computer: Website " + shop.website.level + (shop.website.level < max('website') ? " {upgrade " + price(shop.website.level) + "}" : " {MAXED}");

    showcase += "\n:factory: Factory " + shop.factory.level + (shop.factory.level < max('factory') ? " {upgrade " + price(shop.factory.level) + '}' : " {MAXED}");

    showcase += "\n:truck: Trucks " + shop.trucks.level + (shop.trucks.level < max('trucks') ? " {upgrade " + price(shop.trucks.level) + "}" : " {MAXED}"); 

    var advanced = ":bearded_person: Wisdom " + shop.wisdom.level + (shop.wisdom.level < max('wisdom') ? " {upgrade " + price(shop.wisdom.level) + "}" : "{MAXED}");

    advanced += "\n:mag: Research team " + shop['research team'].level + (shop['research team'].level < max('research team') ? " {upgrade " + price(shop['research team'].level) + "}" : "{MAXED}");

    advanced += "\n:heart: Quality Assurance " + shop["quality assurance"].level + (shop["quality assurance"].level < max('quality assurance') ? " {upgrade " + price(shop["quality assurance"].level) + "}" : "{MAXED}");

    advanced += "\n:headstone: Rituals " + shop.rituals.level + (shop.rituals.level < max('rituals') ? " {upgrade " + price(shop.rituals.level) + "}" : "{MAXED}");

    advanced += "\n:gear: Engineering team " + shop['engineering team'].level + (shop['engineering team'].level < max('engineering team') ? " {upgrade " + price(shop['engineering team'].level) + "}" : "{MAXED}");

    advanced += "\n:chart_with_upwards_trend: Investors " + shop.investors.level + (shop.investors.level < max('investors') ? " {upgrade " + price(shop.investors.level) + "}" : "{MAXED}");

    //advanced += "\n:test_tube: Science team: " + shop["science team"].level + (shop["science team"].level < max('science team') ? " {upgrade " + price(shop["science team"].level) + "}" : "{MAXED}");


    let embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Base: ", value: showcase, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    embed.addField('Advanced:', advanced, true)
    message.channel.send(embed).catch();
  },

  chest(message, Discord, client){
    var cookies = module.exports.getCookies();

    var id = general.getId(message, client);
    var cookieShops = module.exports.getCookieShop(id);

    cookieShops = module.exports.passiveBake(cookieShops, id, cookies);
    general.writeFile(cookieShops, "JSONFiles/cookieShops.json");


    function getTierInfo(tierName, id){
      var tierInfo = "";
      var tier = Object.keys(cookies.tiers[tierName]);
      for (let item of tier){
        item = cookies.tiers[tierName][item];
        tierInfo += '\n' + item.value + " " + item.name + ": " + (cookieShops.shops[id].cooks[item.value] != null ? cookieShops.shops[id].cooks[item.value]: "0");
      }
      return tierInfo != "" ? tierInfo: "n/a";
    }

    var tier1 = getTierInfo('tier1', id);
    var tier2 = getTierInfo('tier2', id);
    var tier3 = getTierInfo('tier3', id);
    var tier4 = getTierInfo('tier4', id);
    var tier5 = getTierInfo('tier5', id);
    var tier6 = getTierInfo('tier6', id);
    var tier7 = getTierInfo('tier7', id);
    var tier8 = getTierInfo('tier8', id);
    var tier9 = getTierInfo('tier9', id)


    var self = general.embedInfo(id, client)
    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Tier 1: ", value: tier1, inline: true},
        {name: "Tier 2: ", value: tier2,inline: true},
        {name: "Tier 3: ", value: tier3, inline: true},
        {name: "Tier 4: ", value: tier4, inline: true},
        {name: "Tier 5: ", value: tier5, inline: true},
        {name: "Tier 6: ", value: tier6, inline: true},
        {name: "Tier 7: ", value: tier7, inline: true},
        {name: "Tier 8: ", value: tier8, inline: true},
        {name: "Tier 9: ", value: tier9, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },

  open(message, Discord, client){
    var cookies = module.exports.getCookies();
    var cookieShops = module.exports.getCookieShop(message.author.id);

    var id = message.author.id;

    if (cookieShops.shops[id] == null || cookieShops.shops[id].cooks["<:chest:934664711436374116>"] == null || cookieShops.shops[id].cooks["<:chest:934664711436374116>"] <= 0){
      message.channel.send("You have no chest to open").catch();
      return;
    }

    cookieShops.shops[id].cooks["<:chest:934664711436374116>"]--;

    var showcase = "";
    var tiers = Object.values(cookies.tiers);
    var options = []
    //console.log(tiers)
    for (let i=0; i < tiers.length; i++){
      options = options.concat(Object.values(tiers[i]));
    }

    for (let i=0; i < 10; i++){
      showcase += "\n";
      var chance = Math.floor(Math.random()*101)+1
      var item = options[Math.floor(Math.random() * options.length)];
      while (chance < 100-item.rarity){
        item = options[Math.floor(Math.random() * options.length)];
      }
      
      var x = Math.abs((Math.floor(Math.random() * 101) + 1)-100);
      var amount = Math.round(item.max * Math.pow(1.05, -x))
      if (amount == 0){
        amount = 1;
      }

      //console.log(item)
      showcase += item.value + ' => ' + amount
      if (cookieShops.shops[id].cooks[item.value] == null){
        cookieShops.shops[id].cooks[item.value] = 0;
      }
      cookieShops.shops[id].cooks[item.value] += amount;
    }

    if (cookieShops.shops[id].ingredients.level >= 8){
      var flask = 1 + cookieShops.shops[id]["engineering team"].level;
      if (cookieShops.shops[id].cooks["<:flask:945767685688537089>"] == null){
        cookieShops.shops[id].cooks["<:flask:945767685688537089>"] = 0;
      }
      cookieShops.shops[id].cooks["<:flask:945767685688537089>"] += flask;
      showcase += "\n<:flask:945767685688537089> => " + flask;
    }

    var self = general.embedInfo(id, client)

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Store: ", value: showcase, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    general.writeFile(cookieShops, 'JSONFiles/cookieShops.json');
    message.channel.send(embed).catch();
  },

  give(message, args){

  },

  daily(message, Discord, client){
    var id = message.author.id;

    var cookies = module.exports.getCookies();
    var cookieShops = module.exports.getCookieShop(id);

    if (cookieShops.shops[id].dailys == null){
      cookieShops.shops[id].dailys = {
        lastReset: 0
      }
    }

    var deltaTime = Math.abs(new Date().getTime() / 1000 - cookieShops.shops[id].dailys.lastReset)
    if (deltaTime < 86400){
      message.channel.send("You have already used your daily. You can use your next one in " + general.convertTime(86400-deltaTime)).catch();
      return;
    }

    var showcase = "";
    
    cookieShops.shops[id].dailys.lastReset = new Date().getTime() / 1000;
    if (cookieShops.shops[id].cooks["<:chest:934664711436374116>"] == null){
      cookieShops.shops[id].cooks["<:chest:934664711436374116>"] = 0;
    }
    cookieShops.shops[id].cooks["<:chest:934664711436374116>"] += cookieShops.shops[id]["morning bagel"].level;

    showcase += "<:chest:934664711436374116> => " + cookieShops.shops[id]["morning bagel"].level

    if (cookieShops.shops[id].ingredients.level >= 7){
      if (cookieShops.shops[id].cooks["<:flour:945767684509945947>"] == null){
        cookieShops.shops[id].cooks["<:flour:945767684509945947>"] = 0;
      }
      cookieShops.shops[id].cooks["<:flour:945767684509945947>"] += cookieShops.shops[id].investors.level;

      if (cookieShops.shops[id].cooks["<:sugar:945767685759848489>"] == null){
        cookieShops.shops[id].cooks["<:sugar:945767685759848489>"] = 0;
      }
      cookieShops.shops[id].cooks["<:sugar:945767685759848489>"] += cookieShops.shops[id].investors.level; 

      showcase += "\n<:flour:945767684509945947> => " + cookieShops.shops[id].investors.level;
      showcase += "\n<:sugar:945767685759848489> => " + cookieShops.shops[id].investors.level;
    }

    if (cookieShops.shops[id].ingredients.level >= 8){
      if (cookieShops.shops[id].cooks["<:flask:945767685688537089>"] == null){
        cookieShops.shops[id].cooks["<:flask:945767685688537089>"] = 0;
      }
      cookieShops.shops[id].cooks["<:flask:945767685688537089>"] += cookieShops.shops[id].investors.level;

      if (cookieShops.shops[id].cooks[":heart:"] == null){
        cookieShops.shops[id].cooks[":heart:"] = 0;
      }
      cookieShops.shops[id].cooks[":heart:"] += cookieShops.shops[id].investors.level; 

      showcase += "\n:heart: => " + cookieShops.shops[id].investors.level;
      showcase += "\n<:flask:945767685688537089> => " + cookieShops.shops[id].investors.level;
    }

    if (cookieShops.shops[id].ingredients.level >= 9){
      if (cookieShops.shops[id].cooks[":ghost:"] == null){
        cookieShops.shops[id].cooks[":ghost:"] = 0;
      }
      cookieShops.shops[id].cooks[":ghost:"] += cookieShops.shops[id].investors.level;

      if (cookieShops.shops[id].cooks[":drop_of_blood:"] == null){
        cookieShops.shops[id].cooks[":drop_of_blood:"] = 0;
      }
      cookieShops.shops[id].cooks[":drop_of_blood:"] += cookieShops.shops[id].investors.level; 

      showcase += "\n:ghost: => " + cookieShops.shops[id].investors.level;
      showcase += "\n:drop_of_blood: => " + cookieShops.shops[id].investors.level;
    }
    
    var self = general.embedInfo(id, client)

    let embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Daily: ", value: showcase, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    general.writeFile(cookieShops, 'JSONFiles/cookieShops.json');
    message.channel.send(embed).catch();
  },

  upgrade(message, args){
    // ingredients: 'what a person can get'
    // oven: 'the quanity of cooks'
    // ads: increases the odds of finding bits
    // shop: increases the amount earned for selling
    // magic: doubles cookies randomly per bake
    // workers: increases the amount of bakes you can do per day
    // morning bagel: increases something with dailys
    // grandma's knowledge: increases the odds of getting better cookies
    // smile: increases the chances of getting tipped a chest


    upgrade = message.content.substring(message.content.indexOf(" ") + 1).trim().toLowerCase();
    if (upgrade == "" || upgrade == null){
      message.channel.send("Invalid input").catch();
      return;
    }

    var id = message.author.id;

    //cookies = module.exports.getCookies();
    cookieShops = module.exports.getCookieShop(id);
    var data = general.readFile();

    if (cookieShops.shops[id] == null){
      message.channel.send("Invalid input").catch();
      return;
    }
    if (cookieShops.shops[id][upgrade] == null){
      message.channel.send("Invalid input").catch();
      return;
    }

    if (cookieShops.shops[id][upgrade].level >= module.exports.getMaxLevel(upgrade)){
      message.channel.send("Already at max level").catch();
      return;
    }

    var price = module.exports.getPrice(cookieShops.shops[id][upgrade].level);

    if (data.stats.personal[id].zeros < price){
      message.channel.send("Not enough bits").catch();
      return;
    }

    data.stats.personal[id].zeros -= price;
    cookieShops.shops[id][upgrade].level++;
    //cookieShops.shops[id][upgrade].price = Math.pow(10, cookieShops.shops[id][upgrade].level)+100;

    data.stats.global.bot.bits.spent += price;
    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].spent == null){
      data.econ.inventory[id].spent = 0;
    }
    data.econ.inventory[id].spent += price;

    message.channel.send("Upgrade complete").catch();
    general.writeFile(data);
    general.writeFile(cookieShops, 'JSONFiles/cookieShops.json')
  }, 
}