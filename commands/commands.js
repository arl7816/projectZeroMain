module.exports = {
  name: "commands",
  description: "This holds the commands and what they do",

  // every commands follows the same simple layout
  commands(message, args){
    messageToSend = "**Commands Include:**";
    messageToSend += "\nsimple";
    messageToSend += "\nstatistics";
    messageToSend += "\neconomy";
    messageToSend += "\nmath_commands";
    messageToSend += "\nbakery";
    messageToSend += "\nopenai";
    messageToSend += "\nbanking";
    messageToSend += "\nhacks";
    messageToSend += "\ngraph {*coming soon*}";
    messageToSend += "\n*To see expanded view type '0NameOfCatagory'*";

    message.channel.send(messageToSend).catch();
  },

  simple(message, args){

    messageToSend = "**Simple Commands:**";
    messageToSend += "\nping → pong";

    messageToSend += "\nflip → flips a coin";
    messageToSend += "\nroll → rolls a die";
    
    messageToSend += "\nhash → I dont remember what this was meant to be";
    messageToSend += "\nfeedback (text) → provides feedback to the creators at Intense Cup Studio's";
    messageToSend += "\ninvite → sends a link to invite the bot into one of your servers";
    messageToSend += "\nbackdoor → sends a link to the backdoor server (get bot updates)"
    
    messageToSend += "\n\n**Custom Commands**";
    messageToSend += '\n\tcustom (commandName "Content of the command") → creates a custom command just for you that you can use {*Does not overwrite core commands*}';
    messageToSend += '\n\treplace (commandName "replacing content") → replaces a custom command';
    messageToSend += "\n\tforget (commandName) → makes the bot forget a custom command";
    messageToSend += "\n\tshowcase → showcases all of your custom commands";

    messageToSend += "\nrandomizer → makes your appearnce random every time a stat is displayed";

    messageToSend += "embed → sends your message as an embed";

    message.channel.send(messageToSend).catch();
  },

  statistics(message, args){

    var messageToSend = "**Statistics:**";
    messageToSend += "\nbot → shows the bots basic stats"
    messageToSend += "\nstats → shows your general stats";
    messageToSend += "\nlevel → shows your level stats";
    messageToSend += '\nmessages → shows your message stats';
    messageToSend += "\nstats_command → shows your command usage";
    messageToSend += "\nserver → shows this servers stats";
    messageToSend += "\nchannel → shows you a channels stats";
    messageToSend += "\nbakes → shows your bakery stats"
    messageToSend += "\npinged {*coming soon*} → shows your pinged stats";
    messageToSend += "\nvoice {*coming soon*} → shows your voice channel stats";
    messageToSend += "\nbits → shows your bits"

    message.channel.send(messageToSend).catch();
  },

  bakery(message, args){
    var messageToSend = "**Bakery:**";
    messageToSend += "\nbake → bake some mother fucking cookies";
    messageToSend += "\nshop → shows your current shop stats";
    messageToSend += "\nstock → shows your current stock of cookies";
    messageToSend += "\nopen → opens a chest you have";

    messageToSend += "\nupgrade (attribute) → upgrades a shop attribute";
    messageToSend += "\ndaily → gives a daily reward";
    messageToSend += '\nsell (cookie) ("amount" or #amount) → sells cookies {*if cookie is all, no amount is needed and amount can either be a number or the word all*}';

    messageToSend += "\n\t *Attributes include:*";

    // ingredients: 'what a person can get'
    // oven: 'the quanity of cooks'
    // ads: increases the odds of finding bits (not implement)
    // shop: increases the amount earned for selling
    // magic: doubles cookies randomly per bake (not implemented)
    // workers: increases the amount of bakes you can do per day
    // morning bagel: increases something with dailys (not implemented)
    // grandma's knowledge: increases the odds of getting better cookies  (not implemented)
    // smile: increases the chances of getting tipped a chest (not implemened)

    messageToSend += "\n\t\tingredients: increases what tier you can get";
    messageToSend += "\n\t\toven: increases the amount of cooks a person does per bake";
    messageToSend += "\n\t\tads: increases the amount of bits made from orders";
    messageToSend += "\n\t\tshop: increases the amount earned for selling";
    messageToSend += "\n\t\tmagic: increases the chances of cookies doubling per bake";
    messageToSend += "\n\t\tworkers: max bakes you can do";
    messageToSend += "\n\t\tschedule: decreases wait time for more bakes"
    messageToSend += "\n\t\tmorning bagel: increases the amount of chest earned per daily";
    messageToSend += "\n\t\tgrandma's knowledge: increases the odds of getting better cookies";
    messageToSend += "\n\t\tsmile: increases the chances of getting tipped a chest";
    messageToSend += "\n\t\twebsite: increases tier of passive cooks";
    messageToSend += "\n\t\tfactory: increase number of cooks per passive bake";
    messageToSend += "\n\t\ttrucks: decrease passive cookie wait time (default time is an hour)";


    messageToSend += '\n\n**Golden Oven:**';
    messageToSend += "\ntable (cookie) → displays the recipe for crafting and brewing cookies";
    messageToSend += "\ncraft (cookie) → crafts a cookie";

    messageToSend += "\n\n**Brewing Station:**";
    messageToSend += "\nbrewery → shows your brewery";
    messageToSend += "\nbrew (cookie) → brews a cookie";
    messageToSend += "\ndrink → collects the content of a brew";

    message.channel.send(messageToSend).catch();
  },

  economy(message, args){

    var messageToSend = "**Economy:**";

    messageToSend += "\n**Custom [*Your stat appearnce*]**";
    messageToSend += "\n\t\tcatagorys:";
      messageToSend += "\n\t\t*color*";
      messageToSend += "\n\t\t*thumbnail*";
      messageToSend += "\n\t\t*footer*";
      messageToSend += "\n\t\t*description*";
      messageToSend += "\n\t\t*title*";
      messageToSend += "\n\t\t*author*";
      messageToSend += "\n\t\t*authorImage*";
    messageToSend += '\n\tstitch (catagory) (#item or "item") → buys an item from a catagory';
    messageToSend += '\n\twear (catagory) (#item or "item") → use an item from your inventory';
    messageToSend += "\n\tcatalog (catagory) → show every item in a catagory";
    messageToSend += "\n\tcloset (catagory) → show every item you own in that catagory";
    messageToSend += "\n\tsave (name)  → saves your current custom layout";
    messageToSend += "\n\twardrobes → shows all saved layouts"
    messageToSend += "\n\tdress (name) → choose a layout from your closet";
    messageToSend += "\n\tshuffle {*coming soon*} → shuffles your layout with every embed";

    messageToSend += "\n\n**Items [*NFT NFT NFT NFT NFT NFT NFT NFT*]**";
    messageToSend += "\n\t\tcatagorys:";
    messageToSend += "\n\t\t*image*";
    messageToSend += "\n\t\t*music*";
    messageToSend += "\n\t\t*gif*";
    messageToSend += "\n\t\t*video*";
    messageToSend += "\n\t\t*emoji*";
    messageToSend += '\n\tbuy (catagory) (#item or "item") → buys an item from a catgory';
    messageToSend += '\n\t display (catagory) (#item or "item") → the bot will display your item if you own it';
    messageToSend += '\n\t store (catagory) (*optional* #type or "type") → will show you every item in a catagory {*if given a type, will only display that type*}';
    messageToSend += '\n\t backpack (catagory) (*optional* #section or "section") → will show every item you own in that catagory {*if given a type, will only display that type*}';
    messageToSend += "\n\t\tTypes:";
    messageToSend += "\n\t\t*common (unlimited amount of them)*";
    messageToSend += "\n\t\t*farm (each server has a limited number of something that will respawn with time)*";
    messageToSend += "\n\t\t *mythic (each server has a limited supply of these)*";
    messageToSend += "\n\t\t*limited {coming soon}(only availble for a certain amount of time)*";
    messageToSend += "\n\t\t*universal (the bot has a limited number of these items)*";

    messageToSend += '\n\tgive @user (catagory) (#item or "item") → gives a user one of your items';
    messageToSend += '\n\ttrade {optional @user} (catagory) (#item or "item") {optional $cost} → sell one of your items';
    messageToSend += '\n\tauction (catagory) (#item or "item") {optional $starting_cost} → auction off one of your items';
  
    message.channel.send(messageToSend).catch();
  },

  math(message, args){
    var messageToSend = "**Math:**";

    messageToSend += "\nmath (equation) → solves base equations";
    messageToSend += "\nconvert ('unit to unit') → converts one unit to another";
    messageToSend += "\nsimplify (expression) → simplifys an expression";
    messageToSend += '\nequation (f(x=#, y=#) = x+y or f(x,y)=x+y "3,#") → plugs in number to an equation and solves';
    messageToSend += "\nsystem {*coming soon*}";
    messageToSend += "\nsolve {*coming soon*}";

    message.channel.send(messageToSend).catch();
  },

  openai(message, args){
    var messageToSend = "**Open Ai: **";

    messageToSend += "\nai (text) {*very early beta and still broken, have fun*} → odes wacky ai things";

    message.channel.send(messageToSend).catch();
  },

  banking(message, args){
    var messageToSend = "**Banking:**";
    messageToSend += "\nbank → shows the community bank";
    messageToSend += "\nfunds → shows your current stocks"
    messageToSend += "\ndeposit (amount) → take money from community bank";
    messageToSend += "\nwithdrawal (amount) → put money into the community bank";

    messageToSend += '\n\ninvest (type) $amount → put money into a stock'
    messageToSend += "\n\tstable\nlow-risk\nmid-risk\nhigh-risk\nequitible";
    messageToSend += "\ncashout → take money out of your stock";
    
    message.channel.send(messageToSend).catch();
  },

  hacks(message, args){
    var messageToSend = "**Hacks:**";
    messageToSend += "\ndecrypt → shows hacks";
    messageToSend += "\nencrypt (name) → buy a hack";
    messageToSend += '\nfirewall → upgrade your hack firewall';

    message.channel.send(messageToSend).catch();
  }
}