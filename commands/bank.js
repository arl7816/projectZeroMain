const general = require('./general');
const hacks = require('./hacks');

const riskTypes = {"stable": true, "low-risk": true, "mid-risk": true, "high-risk": true, "equitie": true};

module.exports = {
  name: "bank",
  description: "holds the banking commands",

  getBank(serverId){
    var banks = general.readFile("JSONFiles/banks.json");
    if (banks.banks[serverId] == null){
      banks.banks[serverId] = {
        checking: 0,
        contributors: {top: []},
      }
    }
    return banks;
  },

  overwriteBank(banks){
    general.writeFile(banks, 'JSONFiles/banks.json');
  },

  bank(message, Discord, client){
    var id = message.author.id;
    var serverId = message.guild.id;

    var banks = module.exports.getBank(serverId);
    var bank = banks.banks[serverId]

    var self = general.embedInfo(id, client)

    var checking = "$" + bank.checking;
    var contributors = "n/a";
    if (bank.contributors.top.length != 0){
      contributors = "";
      for (let i=0; i<3 && i<bank.contributors.top.length; i++){
        contributors += "\n" + client.users.cache.get(bank.contributors.top[i].id).username + ": " + bank.contributors.top[i].total;
      }
    }
    
    var contributions = "n/a";
    if (bank.contributors[id] != null){
      var withdrawn = bank.contributors[id].withdrawn;
      var deposited = bank.contributors[id].deposited;
      contributions = "Score: " + (deposited - withdrawn) + "\nDeposited: $" + deposited + "\nWithdrawn: $" + withdrawn; 
    }

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Checking: ", value: checking, inline: true},
        {name: "Contributors: ", value: contributors, inline: true},
        {name: "Contributions: ", value: contributions, inline: true}
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },

  withdrawal(message, Discord, client){
    var id = message.author.id;
    var serverId = message.guild.id;
    
    var banks = module.exports.getBank(serverId);

    var amount = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (isNaN(amount) || amount == ""){
      message.channel.send("Must input a number to withdrawal").catch();
      return;
    }
    amount = parseInt(amount);

    var data = general.readFile();

    if (banks.banks[serverId].checking < amount){
      message.channel.send("Not enough in checking").catch();
      return;
    }

    data.stats.personal[id].zeros += amount;
    //data.econ.inventory[id].spent -= amount;
    banks.banks[serverId].checking -= amount;

    if (banks.banks[serverId].contributors[id] == null){
      banks.banks[serverId].contributors[id] = {
        withdrawn: 0,
        deposited: 0
      }
    }

    if (banks.stats.users[id] == null){
      banks.stats.users[id] = {}
    }
    if (banks.stats.users[id].withdrawn == null){
      banks.stats.users[id].deposited = 0;
      banks.stats.users[id].withdrawn = 0;
    }

    banks.banks[serverId].contributors[id].withdrawn += amount;
    banks.stats.users[id].withdrawn += amount;

    // need to fix the new top command so if a person already exist they can go backwards in the leaderboard
    banks.banks[serverId].contributors.top = general.newTop(banks.banks[serverId].contributors.top, {id: id, total: banks.banks[serverId].contributors[id].deposited - banks.banks[serverId].contributors[id].withdrawn}, null);

    banks.stats.users.top = general.newTop(banks.stats.users.top, {id: id, total: banks.stats.users[id].deposited - banks.stats.users[id].withdrawn}, null);

    general.writeFile(data);
    module.exports.overwriteBank(banks);

    message.channel.send("You withdrew " + amount + " bits").catch();
    
  },

  deposit(message, Discord, client){
    var amount = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (isNaN(amount) || amount == ""){
      message.channel.send("Must input a number to deposit").catch();
      return;
    }

    amount = parseInt(amount);
    var data = general.readFile();
    var id = message.author.id;

    if (data.stats.personal[id].zeros < amount){
      message.channel.send("You do not have enough bits").catch();
      return;
    }
    
    var serverId = message.guild.id;

    var banks = module.exports.getBank(serverId);
    data.stats.personal[id].zeros -= amount;
    data.econ.inventory[id].spent += amount;
    banks.banks[serverId].checking += amount;

    if (banks.banks[serverId].contributors[id] == null){
      banks.banks[serverId].contributors[id] = {
        withdrawn: 0,
        deposited: 0
      }
    }

    if (banks.stats.users[id] == null){
      banks.stats.users[id] = {}
    }
    if (banks.stats.users[id].deposited == null){
      banks.stats.users[id].deposited = 0;
      banks.stats.users[id].withdrawn = 0;
    }

    banks.banks[serverId].contributors[id].deposited += amount;
    banks.stats.users[id].deposited += amount;

    banks.banks[serverId].contributors.top = general.newTop(banks.banks[serverId].contributors.top, {id: id, total: banks.banks[serverId].contributors[id].deposited - banks.banks[serverId].contributors[id].withdrawn}, null);

    banks.stats.users.top = general.newTop(banks.stats.users.top, {id: id, total: banks.stats.users[id].deposited - banks.stats.users[id].withdrawn}, null);

    general.writeFile(data);
    module.exports.overwriteBank(banks);

    message.channel.send("You deposited " + amount + " bits").catch();
  },

  getInvestment(stock, id){
    const percentOf = (original, percent) => {
      percent /= 100;
      return original * percent;
    }
    
    var currentTime = new Date().getTime() / 1000
    var deltaTime = currentTime - stock.lastChecked;
    if (deltaTime > 3600){
      stock.lastChecked = currentTime;
      var hours = Math.floor(deltaTime / 3600);
      if (hours > 1000){hours = 1000}

      for (var x=0; x<hours; x++){
        var growth = 0;
        var chance = Math.floor(Math.random() * 101) + 1;

        var hack = hacks.getHacks(id);
        var defaultHacks = hacks.getDefault();
        if (hack.users[id].time != null && hack.users[id].time["foresight"] != null){
          if (hacks.getTimeRemaining(hack.users[id].time.foresight.startTime, defaultHacks.hacks.tier3.foresight.maxTime) > 0){
            chance -= 10
          }
        }

        switch (stock.risk){
          case 'stable':
            growth = percentOf(stock.currentAmount, 2)
            break;
          case 'low-risk':
            if (chance < 50){
              growth = percentOf(stock.currentAmount, 5)
            }else if (chance < 70){
              growth = percentOf(stock.currentAmount, 2);
            }else{
              growth = -percentOf(stock.currentAmount, 7)
            }
            break;
          case 'mid-risk':
            if (chance <= 50){
              growth = percentOf(stock.currentAmount, 10);
            }else{
              growth = -percentOf(stock.currentAmount, 10);
            }
            break;
          case 'high-risk':
            if (chance <= 30){
              growth = percentOf(stock.currentAmount, 30);
            }else{
              growth = -percentOf(stock.currentAmount, 10)
            }
            break;
          case 'equitie':
            if (chance <= 10){
              growth = percentOf(stock.currentAmount, 200);
            }else if (chance < 60){
              growth = -percentOf(stock.currentAmount, 50);
            }else{
              growth = -percentOf(stock.currentAmount, 100);
            }
            break;
          default:
            console.log("Something went wrong with this risk type")
            growth = 0;
            break;
        }
        
        if (hack.users[id].time != null && hack.users[id].time["keen_eye"] != null){
          if (hacks.getTimeRemaining(hack.users[id].time.keen_eye.startTime, defaultHacks.hacks.tier3.keen_eye.maxTime) > 0){
            if (growth > 0){
              growth += percentOf(growth, 10)
            }
          }
        }
        
        stock.currentAmount += growth;
        if (stock.currentAmount < 0){
          stock.currentAmount = 0;
        }
        stock.currentAmount = Math.round(stock.currentAmount);
      }
    }
    
    return stock
  },

  invest(message, Discord, client){
    var id = message.author.id;
    var serverId = message.guild.id;
    
    var banks = module.exports.getBank(serverId);

    var amount = message.content.substring(message.content.indexOf("$") + 1).trim();

    var risk = message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf("$"))
    risk = risk.trim();

    if (isNaN(amount) || amount == ""){
      message.channel.send("Must input a number to invest").catch();
      return;
    }
    amount = parseInt(amount);

    var data = general.readFile();

    if (data.stats.personal[id].zeros < amount){
      message.channel.send("You don't have that amount to invest").catch();
      return;
    }
    
    if (risk in riskTypes === false){
      message.channel.send('Invalid stock type').catch();
      return;
    }

    if (banks.stocks[id] == null){
      banks.stocks[id] = {
        stock1: null,
        stock2: null,
        stock3: null
      }
    }

    if (banks.stocks[id].stock1 != null){
      message.channel.send("All stocks are filled").catch();
      return;
    }

    banks.stocks[id].stock1 = {
      risk: risk,
      currentAmount: amount,
      original: amount,
      lastChecked: new Date().getTime() / 1000
    }

    data.stats.personal[id].zeros -= amount;
    data.econ.inventory[id].spent += amount;

    module.exports.overwriteBank(banks);
    general.writeFile(data);

    message.channel.send("Invested " + amount + " bits into a " + risk + " stock").catch();
  },

  stock(message, Discord, client){
    var id = message.author.id;
    var serverId = message.guild.id;

    var banks = module.exports.getBank(serverId);
    var bank = banks.banks[serverId]

    var self = general.embedInfo(id, client)

    var risk = "stable";
    var currentAmount = 0;
    var original = 0;
    var growth = 0;

    var stock1 = "n/a";
    if (banks.stocks[id] != null){
      if (banks.stocks[id].stock1 != null){
        banks.stocks[id].stock1 = module.exports.getInvestment(banks.stocks[id].stock1, id)
        module.exports.overwriteBank(banks);
        
        risk = banks.stocks[id].stock1.risk;
        currentAmount = banks.stocks[id].stock1.currentAmount;
        original = banks.stocks[id].stock1.original;
        growth = Math.round((currentAmount - original) / original * 100)
        
        stock1 = "Risk: " + risk + "\nCurrent: " + currentAmount + "\nOriginal: " + original + "\nGrowth: " + growth + "%";
      }
    }

    // growth = (currentAmount - Original) / original * 100

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Stock1: ", value:  stock1, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },

  cashout(message, Discord, client){
    var id = message.author.id;
    var serverId = message.guild.id;
    var banks = module.exports.getBank(serverId);
    var data = general.readFile();

    // check if they have a stock
    if (banks.stocks[id] == null || banks.stocks[id].stock1 == null){
      message.channel.send("Could not find a stock").catch();
      return;
    }

    // remove the money and give it back
    var amount = banks.stocks[id].stock1.currentAmount;
    var profit = banks.stocks[id].stock1.currentAmount - banks.stocks[id].stock1.original;
    var risk = banks.stocks[id].stock1.risk;
    banks.stocks[id].stock1 = module.exports.getInvestment(banks.stocks[id].stock1, id)

    // remove or add spent money
    if (profit >= 0){
      data.econ.inventory[id].spent -= banks.stocks[id].stock1.original;
    }else{
      data.econ.inventory[id].spent -= amount;
    }

    data.stats.personal[id].zeros += amount;

    // track everything {track total invested and total earned to get net profit}

    // delete the stock
    delete banks.stocks[id].stock1;
    

    // save everything
    general.writeFile(data);
    module.exports.overwriteBank(banks);

    message.channel.send("You got **" + amount + "** bits with a total profit of **" + profit + "** from a **" + risk + "** stock").catch();
  }
}