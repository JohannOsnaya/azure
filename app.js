/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

//Reservation sample
var inMemoryStorage = new builder.MemoryBotStorage();

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var bot = new builder.UniversalBot(connector, [
  function(session){
    // This dialog help the user order dinner to be delivered to their hotel room.
  var dinnerMenu = {
      "Potato Salad - $5.99": {
          Description: "Potato Salad",
          Price: 5.99
      },
      "Tuna Sandwich - $6.89": {
          Description: "Tuna Sandwich",
          Price: 6.89
      },
      "Clam Chowder - $4.50":{
          Description: "Clam Chowder",
          Price: 4.50
      }
  };

  bot.dialog("Hi", [
      function(session){
          session.send("Lets order some dinner!");
          builder.Prompts.choice(session, "Dinner menu:", dinnerMenu);
      },
      function (session, results) {
          if (results.response) {
              var order = dinnerMenu[results.response.entity];
              var msg = `You ordered: ${order.Description} for a total of $${order.Price}.`;
              session.dialogData.order = order;
              session.send(msg);
              builder.Prompts.text(session, "What is your room number?");
          }
      },
      function(session, results){
          if(results.response){
              session.dialogData.room = results.response;
              var msg = `Thank you. Your order will be delivered to room #${session.dialogData.room}`;
              session.endDialog(msg);
          }
      }
  ])
  .triggerAction({
      matches: /^order dinner$/i,
      confirmPrompt: "This will cancel your order. Are you sure?"
  });
    }
]).set('storage', inMemoryStorage); // Register in-memory storage
