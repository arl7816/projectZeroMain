const math = require("mathjs");
const nerdamer = require("nerdamer");

module.exports = {
  name: "math",
  description: "handles math inputs",

  math(message, args){
    content = message.content.substring(message.content.indexOf(" "));

    try{
      var answer = math.evaluate(content).toString();
      message.channel.send("Answer = " + answer);
      return;
    }catch{
      message.channel.send("Invalid input").catch();
    }
  },

  simplify(message, args){
    content = message.content.substring(message.content.indexOf(" "));

    try{
      var answer = math.simplify(content);
      message.channel.send("Answer = " + answer).catch();
    }catch{
      message.channel.send("Invalid input").catch();
    }
  },

  system(message, args){

  },

  solve(message, args ){
    var content = message.content.substring(message.content.indexOf(" "));

    //try{
      var answer = nerdamer(content).toString();
      message.channel.send(answer).catch();
    //}catch{
      //message.channel.send("Invalid input").catch();
    //}
  },

  equation(message, args){
    let parser = new math.parser();
    
    try{
      var content = message.content.substring(message.content.indexOf(" ")).replace(/\s+/g, '').split('"');

      if (content.length == 3){
        // with quotes
        parser.evaluate(content[0])
        var answer = parser.evaluate(content[0][0] + "(" + content[1] + ")");

        message.channel.send("Answer = " + answer).catch();
        return;

      }else if (content.length == 1){
        content = content[0]
        if (content.includes("=")){
          // equation
          var input = content[0] + "(";
          
          var signs = (content.match(/=/g)||[]).length-1;
          for (let i=0; i<signs; i++){
            var index = content.indexOf("=");

            input += content[index+1]
            if (i != signs-1){
              input += ",";
            }

            content = content.substring(0,index) + content.substring(index+2)
          }
          input += ")";

          parser.evaluate(content);
          var answer = parser.evaluate(input);
          message.channel.send("Answer = " + answer).catch();
          return;

        }else{
          // memory equation
          return;
        }
      }
    }catch{
      message.channel.send("Invalid input").catch();
    }

  },
}