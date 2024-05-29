fs = require("fs");
const DataManager = require('./DataManager');

module.exports = {//make it so it stores the command without the 0
  name: "custom",
  description: "Holds commands for custom commands",

  // remember a custom command
  remember(message, args){
    var dm = new DataManager("JSONFiles/custom.json");
    content = message.content;

    // splits the contents of the commmand
    // [content, "output", '']
    content = content.split('"'); 
    if (content.length != 3){
      message.channel.send("Input is wrong").catch();
      return;
    }

    // splits the content into more groups
    // [command, custom command, '']
    command = content[0].split(" ");
    if (command.length != 3){
      message.channel.send("Input is wrong").catch();
      return;
    }

    // get the command and the content
    command = command[1];
    content = content[1];

    //let data = fs.readFileSync("JSONFiles/custom.json").toString();
    //try{data=JSON.parse(data);}catch{}

    /*if (data[message.author.id] == null){
      data[message.author.id] = {};
    } //now lets put differences aside and take me out of timeou, huh. Fine but u may only use the command once in bot tester for the day deal. now complete your dream young one
    if (data[message.author.id][command] == null){
      data[message.author.id][command] = content;
      message.channel.send("Custom command saved").catch();
    }else{
      message.channel.send("Command already exist").catch();
      return;
    }*/

    if (!dm.checkAttri("#customCommand", [message.author.id], command)){
      dm.set("#customCommand", content, [message.author.id], command);
      message.channel.send("Custom command saved.").catch();
    }else{
      message.channel.send("Custom command already exists.").catch();
      return;
    }

    //data = JSON.stringify(data);
    //fs.writeFileSync("JSONFiles/custom.json", data);
    dm.close();
  },

  replace(message, args){
    // does the same as the remember command just slightly differnt
    content = message.content;

    content = content.split('"');
    if (content.length != 3){
      message.channel.send("Input is wrong").catch();
      return;
    }

    command = content[0].split(" ");
    if (command.length != 3){
      message.channel.send("Input is wrong").catch();
      return;
    }

    command = command[1];
    content = content[1];

    let data = fs.readFileSync("JSONFiles/custom.json").toString();
    try{data=JSON.parse(data);}catch{}

    if (data[message.author.id] == null){
      data[message.author.id] = {};
    }

    if (data[message.author.id][command] != null){
      data[message.author.id][command] = content;
      message.channel.send("Command replaced").catch();
    }else{
      message.channel.send("Command does not exist").catch();
      return;
    }

    data = JSON.stringify(data);
    fs.writeFileSync("JSONFiles/custom.json", data);
  },

  // makes the bot forget a command
  forget(message, args){
    // gets the name of the command
    content = message.content.split(" ");
    if (content.length == 1){
      message.channel.send("Input wrong").catch();
      return;
    }
    let command = content[1];

    let data = fs.readFileSync("JSONFiles/custom.json").toString();
    try{data=JSON.parse(data);}catch{}

    if (data[message.author.id] == null || data[message.author.id][command] == null){
      message.channel.send("Command does not exist").catch();
      return;
    }

    delete data[message.author.id][command];
    message.channel.send("Command was forgotten").catch();
    data = JSON.stringify(data);
    fs.writeFileSync("JSONFiles/custom.json", data);
  },

  // uses a custom command if it exist
  custom(message, command){
    //let command = message.content.split(" ")[0];

    let data = fs.readFileSync("JSONFiles/custom.json").toString();
    try{data=JSON.parse(data);}catch{}   

    if (data[message.author.id] == null){
      data[message.author.id] = {};
    }

    if (data[message.author.id][command] != null){
      message.channel.send(data[message.author.id][command]).catch();
    } 
  },

  // goes through each of the command names and shows the user what commands they have
  showcase(message, args){
    let data = fs.readFileSync("JSONFiles/custom.json").toString();
    try{data=JSON.parse(data);}catch{}

    if (data[message.author.id] == null){
      message.channel.send("You dont have any commands").catch();
      return;
    }

    let keys = Object.keys(data[message.author.id]);

    if (keys.length == 0){
      message.channel.send("You dont have any commands").catch();
      return;
    }

    keys = "Your custom commands include:\n" + keys.join("\n");
    message.channel.send(keys).catch();
  },

  global(message, args){ // makes a custom command usable by a whole server

  },

  local(){ // makes a custom command usable by just you

  },

  showcaseGlobal(){ // show what commands can be used by what server

  }
}