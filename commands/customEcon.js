const general = require('./general');
const hack = require('./hacks')

module.exports = {
  name: "customEcon",
  description: "Holds the commands for personalification",

  buy(message, args){
    /*var content = message.content.substring(message.content.indexOf(" ")).replace(/\s+/g, '');
    var id = message.author.id;

    if (content.includes("#")){
      content = content.split("#");
      if (content.length != 2){
        message.channel.send("Invalid input").catch();
        return;
      }
    }else{
      content = content.split('"');
      if (content.length != 3){
        message.channel.send("Invalid input").catch();
        return;
      }
    }*/

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

    var section = "custom";
    /*let sections = Object.keys(defaultEcon);
    for (let tempSection of sections){
      if (defaultEcon[tempSection][catagory] != null){
        section = tempSection;
        break;
      }
    }

    if (section == null){
      message.channel.send("Invalid ").catch();
      return;
    }*/

    // check if the person has a inventory, if they dont give them one
    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id][section] == null){
      data.econ.inventory[id][section] = {};
    }

    // check if the person has input a catagory
    if (defaultEcon[section][catagory] != null){
      
      // if there is a default, give the person one
      if (data.econ.inventory[id][section][catagory]==null && defaultEcon[section].default != null){
        data.econ.inventory[id][section][catagory] = defaultEcon[section].default[catagory]
      }

      var choice = null;
      if (!isNaN(parameter)){ // is a number
        choice = Object.values(defaultEcon[section][catagory])[parameter-1]
      }else{ // is not a number
        choice = defaultEcon[section][catagory][parameter]
      }
      
      if (choice == null && defaultEcon[section][catagory].customizable == null){
        message.channel.send("Not a choice").catch();
        return;
      }
      // if the choice is null and but is customizable give them their own custom item
      if (choice == null && defaultEcon[section][catagory].customizable != null){
        choice = {price: defaultEcon[section][catagory].customizable.price, value: parameter, name: parameter}
      }

      if (choice.name == "customizable"){
        message.channel.send("customizable is not a choice").catch();
        return;
      }

  
      if (data.econ.inventory[id][section][catagory]==null){
        data.econ.inventory[id][section][catagory] = {}
      }

      if (data.econ.inventory[id][section][catagory][choice.name] != null){
        message.channel.send("You already own this").catch();
        return;
      }

      if (choice.price > data.stats.personal[id].zeros){
        message.channel.send("You do not have enough bits").catch();
        return;
      }

      // make the purchase
      data.stats.personal[id].zeros -= choice.price;
      data.stats.global.bot.bits.spent += choice.price;

      if (data.econ.inventory[id].spent == null){
        data.econ.inventory[id].spent = 0;
      }
      data.econ.inventory[id].spent += choice.price;

      data.econ.inventory[id][section][catagory][choice.name] = choice.value;

      message.channel.send("Purchase successful!").catch();
      general.writeFile(data);
      return;

    }else{
      message.channel.send("Invalid input").catch();
    }
  },

  use(message, args){
    /*var content = message.content.substring(message.content.indexOf(" ")).replace(/\s+/g, '');
    var id = message.author.id;

    if (content.includes("#")){
      content = content.split("#");
      if (content.length != 2){
        message.channel.send("Invalid input").catch();
        return;
      }
    }else{
      content = content.split('"');
      if (content.length != 3){
        message.channel.send("Invalid input").catch();
        return;
      }
    }

    var catagory = content[0];
    var parameter = content[1];*/

    // get the catagory and parameter
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
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }

    if (defaultEcon.custom[catagory] != null){
      if (data.econ.inventory[id].custom[catagory]==null){
        data.econ.inventory[id].custom[catagory] = defaultEcon.custom.default[catagory]
      }

      var choice = null;
      if (!isNaN(parameter)){ // is a number
        choice = Object.values(data.econ.inventory[id].custom[catagory])[parameter-1];
      }else{ // is not a number
        choice = data.econ.inventory[id].custom[catagory][parameter];
      }
      if (choice == null){
        message.channel.send("Not a choice").catch();
        return;
      }

      if (data.econ.inventory[id].custom.self == null){
        data.econ.inventory[id].custom.self = {}
      }

      // use the item
      data.econ.inventory[id].custom.self[catagory] = choice;
      data.econ.inventory[id].custom.self.random = false;
      message.channel.send("Pick was successful!").catch();
      general.writeFile(data);
    }

  },

  // goes through each thing thats available in a catagory
  show(message, args){
    var catagory = message.content.substring(message.content.indexOf(" ") + 1);
    
    catagory = catagory.trim();

    var defaultEcon = general.readFile("JSONFiles/econDefault.json");

    if (defaultEcon.custom[catagory] != null){
      var showcase = "";
      var keys = Object.keys(defaultEcon.custom[catagory]);
      for (let i=0; i<keys.length; i++){
        showcase += (i+1).toString() + ". " + keys[i] + ": " + defaultEcon.custom[catagory][keys[i]].price + "\n";
      }
      message.channel.send(showcase).catch();

    }else{
      message.channel.send("Invalid parameter").catch();
    }
  },

  // goes through each item a person owns in a catagory and displays them
  inventory(message, args){
    /*var catagory = message.content.substring(message.content.indexOf(" ")).replace(/\s+/g, '');
    var id = message.author.id;*/

    var catagory = message.content.substring(message.content.indexOf(" ") + 1);
    var id = message.author.id;
    
    catagory = catagory.trim();

    let data = general.readFile();
    let defaultEcon = general.readFile("JSONFiles/econDefault.json");

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }

    if (defaultEcon.custom[catagory] != null){
      
      if (data.econ.inventory[id].custom[catagory]==null){
        if (defaultEcon.custom.default[catagory] == null){
          message.channel.send("You dont own anything at the moment").catch();
          return;
        }
        data.econ.inventory[id].custom[catagory] = defaultEcon.custom.default[catagory]
      }

      keys = Object.keys(data.econ.inventory[id].custom[catagory]);
      var showcase = "";
      for (var i=0; i<keys.length; i++){
        showcase += (i+1).toString() + ". " + keys[i] + "\n";
      }
      message.channel.send(showcase).catch();
      return;
    }else{
      message.channel.send("Invalid input").catch();
    }
  },

  save(message, args){
    var id = message.author.id;
    var data = general.readFile();
    var name = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (name == ""){
      message.channel.send("Input invalid").catch();
      return;
    }

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }
    if (data.econ.inventory[id].custom.wardrobe == null){
      data.econ.inventory[id].custom.wardrobe = {};
    }

    if (data.econ.inventory[id].custom.wardrobe[name] != null){
      message.channel.send("This wardrobe already exist").catch();
      return;
    }

    data.econ.inventory[id].custom.wardrobe[name] = data.econ.inventory[id].custom.self;message.channel.send("Wardrobe has been saved").catch();
    general.writeFile(data); 
  },

  wardrobe(message, args){
    var id = message.author.id;
    var data = general.readFile();

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }
    if (data.econ.inventory[id].custom.wardrobe == null){
      message.channel.send("You dont have any saved wardrobes").catch();
      return;
    }

    var showcase = "";
    let wardrobes = Object.keys(data.econ.inventory[id].custom.wardrobe);
    for (var i=0; i< wardrobes.length; i++){
      showcase += "\n" + (i+1).toString() + ". " + wardrobes[i];
    }
    message.channel.send(showcase).catch();
  },

  dress(message, args){
    var id = message.author.id;
    var data = general.readFile();
    var name = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }
    if (data.econ.inventory[id].custom.wardrobe == null){
      message.channel.send("You dont have any saved wardrobes").catch();
      return;
    }

    if (!isNaN(name)){
      name = Object.keys(data.econ.inventory[id].custom.wardrobe)[name-1];
    }

    if (data.econ.inventory[id].custom.wardrobe[name] == null){
      message.channel.send("That wardrobe doesn't exist").catch();
      return;
    }

    data.econ.inventory[id].custom.self = data.econ.inventory[id].custom.wardrobe[name];
    message.channel.send("Welcome to the new you").catch();
    general.writeFile(data)
  },

  refab(message, args){
    var id = message.author.id;
    var data = general.readFile();
    var name = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (name == ""){
      message.channel.send("Input invalid").catch();
      return;
    }

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }
    if (data.econ.inventory[id].custom.wardrobe == null){
      data.econ.inventory[id].custom.wardrobe = {};
    }

    if (!isNaN(name)){
      name = Object.keys(data.econ.inventory[id].custom.wardrobe)[name-1];
    }

    if (data.econ.inventory[id].custom.wardrobe[name] == null){
      message.channel.send("This wardrobe does not exist exist").catch();
      return;
    }

    data.econ.inventory[id].custom.wardrobe[name] = data.econ.inventory[id].custom.self;message.channel.send("Wardrobe has been refabricated").catch();
    general.writeFile(data); 
  },

  garbage(message, args){
    var id = message.author.id;
    var data = general.readFile();
    var name = message.content.substring(message.content.indexOf(" ") + 1).trim();

    if (name == ""){
      message.channel.send("Input invalid").catch();
      return;
    }

    if (data.econ.inventory[id] == null){
      data.econ.inventory[id] = {};
    }
    if (data.econ.inventory[id].custom == null){
      data.econ.inventory[id].custom = {};
    }
    if (data.econ.inventory[id].custom.self == null){
      data.econ.inventory[id].custom.self = {};
    }
    if (data.econ.inventory[id].custom.wardrobe == null){
      data.econ.inventory[id].custom.wardrobe = {};
    }

    if (!isNaN(name)){
      name = Object.keys(data.econ.inventory[id].custom.wardrobe)[name-1];
    }

    if (data.econ.inventory[id].custom.wardrobe[name] == null){
      message.channel.send("This wardrobe does not exist exist").catch();
      return;
    }

    if (data.econ.inventory[id].custom.wardrobe[name] == data.econ.inventory[id].custom.self){
      data.econ.inventory[id].custom.self = {};
    }

    delete data.econ.inventory[id].custom.wardrobe[name];
    message.channel.send("Wardrobe has been deleted").catch();
    general.writeFile(data); 
  },

  random(message, Discord, client){
    var id = message.author.id

    var data = general.readFile();
    var hacks = hack.getHacks(id);

    if (hacks.users[id] != null && hacks.users[id].perm["randomizer"] && hacks.users[id].perm.randomizer.active){
      if (data.econ.inventory[id].custom.self == null){
        data.econ.inventory[id].custom.self = {}
      }

      var stop = !message.content.toLowerCase().includes("stop")
      
      data.econ.inventory[id].custom.self.random = stop

      general.writeFile(data);
      if (stop){
        message.channel.send("Your appearance is now random").catch();
      }else{
        message.channel.send("Your appearance is no longer random").catch();
      }
    }else{
      message.channel.send("You do not have access to this command").catch();
    }
  }
}