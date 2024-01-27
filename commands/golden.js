const general = require('./general');
const mine = require('./mine');
const hacks = require('./hacks');

module.exports = {
  name: "golden",
  description: "holds the commands for the golden oven and brewing station",

  // shows the recipe to craft and to brew
  table(message, Discord, client){
    // check if they have access to the golden oven
    var content = message.content.substring(message.content.indexOf(' ') + 1).trim();
    var cookies = mine.getCookies();
    var tiers = Object.keys(cookies.tiers);
    var cookie = null
    for (var tier of tiers){
      if (cookies.tiers[tier][content] != null){
        cookie = cookies.tiers[tier][content];
        break;
      }
    }

    if (cookie == null){
      message.channel.send("Could not find cookie").catch();
      return;
    }

    var craft = "n/a";
    var brew = "n/a";

    if (cookie.crafting != null){
      // crafting
      if (cookie.crafting.build != null && cookie.crafting.build != {}){
        var prices = Object.keys(cookie.crafting.build);
        craft = "";
        for (var price of prices){
          craft += "\n" + price + ": " + cookie.crafting.build[price]
        }
      }

      // brewing
      if (cookie.crafting.brew != null && cookie.crafting.brew != {}){
        var prices = Object.keys(cookie.crafting.brew);
        brew = "";
        for (var price of prices){
          brew += "\n" + price + ": " + cookie.crafting.brew[price]
        }
      }
    }

    let embed = general.baseEmbed(message, Discord, client);
    embed.addField("Crafting:", craft, true);
    embed.addField("Brewing:", brew, true);

    message.channel.send(embed)
  },

  // allows you to craft a cookie
  craft(message, Discord, client){
    // check for golden oven
    var hack = hacks.getHacks(message.author.id);
    if (hack.users[message.author.id].perm.golden_oven == null){
      message.channel.send("You do not have the golden oven hack").catch();
      return
    }
    
    var content = message.content.substring(message.content.indexOf(' ') + 1).trim();
    
    var cookies = mine.getCookies();
    var tiers = Object.keys(cookies.tiers);
    var cookie = null
    for (var tier of tiers){
      if (cookies.tiers[tier][content] != null){
        cookie = cookies.tiers[tier][content];
        break;
      }
    }

    if (cookie == null){
      message.channel.send("Could not find cookie").catch();
      return;
    }

    if (cookie.crafting == null){
      message.channel.send("Crafting not available").catch();
      return;
    }

    if (cookie.crafting.build == null || cookie.crafting.build === {}){
      message.channel.send("Crafting not available").catch();
      return;
    }
    
    var data = general.readFile();
    var id = message.author.id;
    var cookieShops = mine.getCookieShop(id);
    var prices = Object.keys(cookie.crafting.build);
    for (var price of prices){
      if (price == "bits"){
        if (cookie.crafting.build[price] > data.stats.personal[id].zeros){
          message.channel.send('Missing bits!').catch();
          return;
        }
        data.stats.personal[id].zeros -= cookie.crafting.build[price]
      }else{
        if (cookieShops.shops[id].cooks[price] < cookie.crafting.build[price]){
          message.channel.send('Missing cookies').catch();
          return;
        }
        cookieShops.shops[id].cooks[price] -= cookie.crafting.build[price]
      }
    }

    if (cookieShops.shops[id].cooks[cookie.value] == null){
      cookieShops.shops[id].cooks[cookie.value] = 0;
    }
    cookieShops.shops[id].cooks[cookie.value] += cookie.crafting.perCraft

    var show = "Crafted!";
    
    if (cookieShops.shops[id].ingredients.level >= 9){
      if (cookieShops.shops[id].cooks[":ghost:"] == null){
        cookieShops.shops[id].cooks[":ghost:"] = 0;
      }
      cookieShops.shops[id].cooks[":ghost:"] += cookieShops.shops[id].rituals.level;
      show += "\nOops you *accidentally* sacrificed " + cookieShops.shops[id].rituals.level + " workers :ghost:";
    }

    general.writeFile(data);
    general.writeFile(cookieShops, 'JSONFiles/cookieShops.json');
    message.channel.send(show).catch();
  },

  // starts a brew
  brew(message, Discord, client){
    var id = message.author.id;

    var hack = hacks.getHacks(id);
    if (hack.users[id].perm.brewing_station == null){
      message.channel.send("You do not have a brewing station").catch();
      return;
    }
    
    var data = general.readFile();
    var shops = mine.getCookieShop(id);
    shop = shops.shops[id];

    var cookies = mine.getCookies();

    var content = message.content.substring(message.content.indexOf(" ") + 1).trim();
    
    // check if the person inputed the correct thing
    var cookie = null;
    for (let tier of Object.keys(cookies.tiers)){
      if (cookies.tiers[tier][content] != null){
        cookie = cookies.tiers[tier][content];
        break;
      }
    }

    if (cookie == null){
      message.channel.send("Could not find that cookie").catch();
      return;
    }else{
      if (cookie.crafting == null || cookie.crafting.brew == null){
        message.channel.send("Cookie cannot be brewed at this time").catch();
        return;
      }
    }

    // check if the brewing spot is open
    if (shop.cooks.brewery.brew1 != null){
      message.channel.send("No brewing spot open").catch();
      return;
    }
    
    // check if the person can afford the brew
    var prices = Object.keys(cookie.crafting.brew);
    for (let price of prices){
      if (price == "bits"){
        if (cookie.crafting.brew[price] > data.stats.personal[id].zeros){
          message.channel.send('Missing bits!').catch();
          return;
        }
        data.stats.personal[id].zeros -= cookie.crafting.brew[price]
      }else{
        if (shop.cooks[price] < cookie.crafting.brew[price]){
          message.channel.send('Missing cookies').catch();
          return;
        }
        shop.cooks[price] -= cookie.crafting.brew[price]
      }
    }

    // begin the brew
    if (shop.cooks.brewery.brew1 == null){
      shop.cooks.brewery.brew1 = {
        value: cookie.value,
        total: 1,
        lastChecked: new Date().getTime() / 1000,
        timePerCraft: cookie.crafting.timePerCraft
      }
    }

    // save and notify
    general.writeFile(shops, "JSONFiles/cookieShops.json");
    general.writeFile(data);
    message.channel.send("Brew has begun").catch();
  },

  // allows you to look into your brewing station(s)
  brewery(message, Discord, client){
    var id = general.getId(message, client)

    var hack = hacks.getHacks(id);
    if (hack.users[id].perm.brewing_station == null){
      message.channel.send("You do not have a brewing station").catch();
      return;
    }
    
    var shops = mine.getCookieShop(id);
    shop = shops.shops[id]
    
    let embed = general.baseEmbed(message, Discord, client)

    brew1 = shop.cooks.brewery.brew1;
    if (brew1 == null){
      embed.addField("Brew 1:", "n/a", true);
    }else{
      brew1 = module.exports.newBrew(id, brew1)

      var value = brew1.value;
      var amount = brew1.total;

      var nextBrew = brew1.timePerCraft - (new Date().getTime() / 1000 - brew1.lastChecked);
      nextBrew = 
      nextBrew = general.convertTime(nextBrew);

      embed.addField("Brew 1:", value + ": " + amount + "\nNext: " + nextBrew);
    }

    message.channel.send(embed).catch();

    general.writeFile(shops, "JSONFiles/cookieShops.json");
  },

  // gives you the cookies from a brewing station
  drink(message, Discord, client){
    var id = message.author.id;

    var hack = hacks.getHacks(id);
    if (hack.users[id].perm.brewing_station == null){
      message.channel.send("You do not have a brewing station").catch();
      return;
    }
    
    var data = general.readFile();
    var shops = mine.getCookieShop(id);
    var shop = shops.shops[id];

    brew1 = shop.cooks.brewery.brew1;
    if (brew1 == null){
      message.channel.send("You dont have a brew to take").catch();
      return;
    }

    if (shops.shops[id].cooks[brew1.value] == null){
      shops.shops[id].cooks[brew1.value] = 0;
    }
    shops.shops[id].cooks[brew1.value] += brew1.total;

    delete shops.shops[id].cooks.brewery.brew1;
    general.writeFile(shops, "JSONFiles/cookieShops.json");
    message.channel.send("Brew has been collected").catch();
  },

  // brews cookies based on a delta time
  newBrew(id, brew){
    var currentTime = new Date().getTime() / 1000
    var deltaTime = currentTime - brew.lastChecked;

    var crafts = Math.floor(deltaTime / brew.timePerCraft);

    if (crafts > 0){
      brew.lastChecked = currentTime;
    }
    
    for (var i=0; i<crafts; i++){
      brew.total++;
    }
    
    return brew;
  },
}