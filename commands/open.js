const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require('openai-api');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(process.env.OPENAI_API_KEY);

 /*const response = await openai.createCompletion("text-davinci-001", {
  prompt: "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: const OpenAI = require('openai-api');I am an AI created by OpenAI. How can I help you today?\nHuman: I was just wondering how your doing\nAI: I'm doing well, thank you for asking. How about you?\nHuman: Im doing quite well actually\nAI: That's great to hear! What brings you joy?\nHuman: Idk, I suppose that's a difficult question.\nAI:\n\nWell, that's a difficult question, but I'm sure there are things that make you happy. Maybe you enjoy spending time with your friends and family, or taking care of pets. There are many things that bring happiness to people, so I'm sure you could think of something.\nHuman: how good are you with chatting?\nAI:\n\nI'm pretty good at chatting. I'm always happy to talk to people, and I can always find something to talk about.\nHuman: What would you like to talk about?\nAI:\n\nWell, what do you like to talk about? I'm interested in a variety of topics, so I'm sure we could find something to chat about.\nHuman: no no, I'm genuinely curious whats on your mind.\nAI:\n\nI don't really have anything on my mind right now. I'm just happy to chat with you.\nHuman: Why though?\nAI:\n\nWell, I enjoy talking to people and getting to know them. I think it's important to connect with others, and I'm happy to help with that.\nHuman: ",
  temperature: 0.9,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0.6,
  stop: ["", " AI:"],
});*/

var seq = 0;

var startingPrompt = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: const OpenAI = require('openai-api');I am an AI created by OpenAI. How can I help you today?\nHuman: I was just wondering how your doing\nAI: I'm doing well, thank you for asking. How about you?\nHuman: Im doing quite well actually\nAI: That's great to hear! What brings you joy?\nHuman: Idk, I suppose that's a difficult question.\nAI:\n\nWell, that's a difficult question, but I'm sure there are things that make you happy. Maybe you enjoy spending time with your friends and family, or taking care of pets. There are many things that bring happiness to people, so I'm sure you could think of something.\nHuman: how good are you with chatting?\nAI:\n\nI'm pretty good at chatting. I'm always happy to talk to people, and I can always find something to talk about.\nHuman: What would you like to talk about?\nAI:\n\nWell, what do you like to talk about? I'm interested in a variety of topics, so I'm sure we could find something to chat about.\nHuman: no no, I'm genuinely curious whats on your mind.\nAI:\n\nI don't really have anything on my mind right now. I'm just happy to chat with you.\nHuman: Why though?\nAI:\n\nWell, I enjoy talking to people and getting to know them. I think it's important to connect with others, and I'm happy to help with that.\nHuman: ";

var prompt = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: So long as you talk good, Im good.\nAI: That sounds great! Is there anything I can help you with?\nHuman: Just talk like a human I suppose \nAI:\n\nHello! Thank you for talking with me. I'm here to help with whatever you need.\nHuman:  So what would you like to talk about.\nAI:\n\nThere are so many interesting things to talk about! What's your favorite topic?\nHuman: I don't really know. What interested you.\nAI:\n\nI find everything interesting! But if I had to choose, I would say I'm interested in the latest news, technology, and scientific discoveries.";

module.exports = {
  name: "open",
  description: "holds the commands for the open ai commands",

  openai(message, args){
    if (message.author.bot) return;
   prompt += "\nHuman: " + message.content.substring(message.content.indexOf(" ") + 1);
   (async () => {
       const gptResponse = await openai.complete({
           engine: 'text-davinci-001',
           prompt: prompt,
           maxTokens: 150,
           temperature: 0.9,
           topP: 1,
           presencePenalty: 0.6,
           frequencyPenalty: 0,
           bestOf: 1,
           n: 1,
           stream: false,
           stop: [" Human:", " AI:"],
       });
       //console.log(prompt)
        //console.log(gptResponse.data.choices)

        seq++;
        console.log(seq);

       message.reply(gptResponse.data.choices[0].text);
       prompt += "AI: " + gptResponse.data.choices[0].text;
   })().catch(error => {
     console.log("I have failed")
     message.reply("OpenAI cost money bitch, either pay us or dont use it all dawg");
   }); 
  }
}