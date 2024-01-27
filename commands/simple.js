const fs = require("fs")
const general = require("./general")

module.exports = {
  name: "simple",
  description: "Holds some of the more simple commands",

  // pings
  ping(message, args) {
    message.channel.send('🏓 **pong!**\n**Latency:** ' + (Date.now() - message.createdTimestamp).toString() + "ms"); // says pong
  },

  script(message, args) {
    var content = message.content.substring(message.content.indexOf(" ") + 1).trim();

    eval(content);
  },

  botPing(message) {
    messageToSend = "Hello " + message.author.username + ", I'm Project Zero, a universal bot to help keep track yourself";
    messageToSend += "\nVersion number: 1.0.0";
    messageToSend += "\nPrefix: '0'";
    messageToSend += "\nPlease use '0commands' to get a list of my commands or '0bot' to get some of my stats";

    message.channel.send(messageToSend).catch();
  },

  invite(message, args) {
    message.channel.send("https://discord.com/api/oauth2/authorize?client_id=894043486637137961&permissions=8&scope=bot").catch();
  },

  // does hashe stuff
  hash(message, args) {
    let map = new Map();
    map.set("a", "loser")
    message.channel.send(map.get("a"));
  },

  feedback(message, args) {
    var content = message.content.substring(message.content.indexOf(" ") + 1);

    var text = fs.readFileSync("TextFiles/ideas.txt", 'utf8');

    text += "\n\n" + message.author.username + ": " + content;

    fs.writeFileSync("TextFiles/ideas.txt", text);

    message.reply("thank you for the feedback!").catch();
  },

  // sends a zero, the zeros increase once for each time is called
  zero(message, args) {
    let data = fs.readFileSync("JSONFiles/zeros.json").toString();
    try { data = JSON.parse(data); } catch{ }

    if (data[message.author.id] == null) {
      data[message.author.id] = 1;
    }

    message.channel.send("0".repeat(data[message.author.id]));

    // dont allow the message to exceed 2000 characters
    if (data[message.author.id] < 2000) {
      data[message.author.id]++;
    }

    data = JSON.stringify(data);
    fs.writeFileSync("JSONFiles/zeros.json", data);
  },

  bits(message, Discord, client){
    var id = general.getId(message, client);
    
    var self = general.embedInfo(id, client)

    var data = general.readFile();

    var bits = 0;
    try{
      bits = data.stats.personal[id].zeros;
    }catch{
      bits = 0;
    }
    
    var spent = 0;
    try{
      spent = data.econ.inventory[id].spent;
    }catch{
      spent = 0;
    }
    var total = bits + spent;

    var show = "Bits: " + bits + "\nTotal: " + total + "\nSpent: " + spent;

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        {name: "Info ", value: show, inline: true},
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');
    
    message.channel.send(embed).catch();
  },
  
  bakes(message, Discord, client) {
    data = general.readFile();

    let id = general.getId(message, client);

    if (data.stats.personal[id] == null) {
      message.channel.send("N/A").catch();
      return;
    }

    var self = general.embedInfo(id, client)

    var bakes = "";
    try {
      bakes += "\nCooks: " + data.stats.personal[id].bakery.bakes.cooks;
      bakes += "\nTotal Cookies: " + data.stats.personal[id].bakery.bakes.total;
      bakes += "\nDailys: " + (data.stats.personal[id].bakery.bakes.daily != null ? data.stats.personal[id].bakery.bakes.daily : "n/a");
    } catch{
      bakes = "n/a";
    }


    var sold = "";
    try {
      sold += "\nTotal Sold: " + data.stats.personal[id].bakery.sold.total;
      sold += "\nTotal Earned: " + data.stats.personal[id].bakery.sold.earned;
      sold += "\nOpened chest: " + (data.stats.personal[id].bakery.bakes.chest != null ? data.stats.personal[id].bakery.bakes.chest : "n/a");
    } catch{
      sold = "n\a"
    }

    var cookies = "";
    try {
      for (let i = 0; i < 3 && i < data.stats.personal[id].bakery.bakes.top.length; i++) {
        cookies += "\n" + data.stats.personal[id].bakery.bakes.top[i].id + ": " + data.stats.personal[id].bakery.bakes.top[i].total;
      }
    } catch{
      cookies = "n/a";
    }

    const embed = new Discord.MessageEmbed() // creates an embed
      .setColor(self.color)
      .setTitle(self.title)
      .setURL(self.url)
      .setAuthor('User: ' + self.author, self.authorImage)
      .setDescription(self.description)
      .setThumbnail(self.thumbnail)
      .addFields(
        { name: "Bakes: ", value: bakes, inline: true },
        { name: "Sold: ", value: sold, inline: true },
        { name: "Cookies: ", value: cookies, inline: true }
      )
      //.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter(self.footer, 'https://i.imgur.com/AfFp7pu.png');

    message.channel.send(embed).catch();
  },
  flip(message, args){
    var n = Math.floor(Math.random() * 2);
    if (n == 0){
      message.channel.send(":slight_smile:").catch();
      return;
    }
    message.channel.send(":coin:").catch();
  },

  roll(message, args){
    var choices = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:"];

    var choice = choices[Math.floor(Math.random() * choices.length)];

    message.channel.send(choice).catch();
  },
}