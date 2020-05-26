const dialogflow = require('dialogflow');
const eris = require('eris');
const Compute = require('@google-cloud/compute');

const sessionClient = new dialogflow.SessionsClient();
const projectId = "PLACEHOLDER";
const sessionId = "0";
const languageCode = "en";

const compute = new Compute();

const bot = new eris.CommandClient("PLACEHOLDER", {}, {
    description: "A test bot made with Eris",
    owner: "AhmedHalat",
    prefix: "!"
});

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
  console.log('Connected and ready. V1.1.1');
});

async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      }
    }
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  console.log("1res", responses)
  return responses[0];
}

async function executeQueries(projectId, sessionId, query, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  var responses = "";
  let context;
  let intentResponse;
  try {
    console.log(`Sending Query: ${query}`);
    intentResponse = await detectIntent(projectId, sessionId, query, context,languageCode);
    console.log(`Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`);
    responses = intentResponse.queryResult.fulfillmentText || "There may have been an error";
    // Use the context from this response for next queries
    context = intentResponse.queryResult.outputContexts;
  } catch (error) {
    console.log(error);
  }
  console.log("2res", responses)
  return Promise.resolve(responses)
}

bot.on('messageCreate', async (msg) => {
    var botWasMentioned = msg.mentions.find(mentionedUser => mentionedUser.id === bot.user.id,);
    if (botWasMentioned){
      var author = `<@!${msg.author.id}>`;
      content = msg.content.toString().toLowerCase().replace("<@!685821709206421504>", "");
      var res = await Promise.resolve(executeQueries(projectId, sessionId, content, languageCode));
      console.log("3res", res)
      await msg.channel.createMessage(res);
    }

});

bot.on('error', err => {
  console.warn(err);
});

const vanillaCommand = bot.registerCommand("vanilla", (msg, args) => { // Make an echo command
    if(args.length === 0) { // If the user just typed "!echo", say "Invalid input"
      try {
        var res = executeQueries(projectId, sessionId, "Status mc-server", languageCode)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Make the bot say something",
    fullDescription: "The bot will echo whatever is after the command label.",
    reactionButtons: [ // Add reaction buttons to the command
    {
      emoji: "Ã¢â€žÂ¹Ã¯Â¸Â",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "Status mc-server", languageCode)
        } catch (e) {
          return "ERROR"
        }

        return res;
      }
    },
    {
      emoji: "Ã¢â€“Â¶Ã¯Â¸Â",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "start mc-server", languageCode)
        } catch (e) {
          return "FAILED TO START"
        }
        return res;
      }
    },
    {
      emoji: "Ã¢ÂÂ¹",
      type: "edit", // Pick a new pong variation
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "stop mc-server", languageCode)
        } catch (e) {
          return "FAILED TO STOP"
        }
        return res;
      }
    }
  ]
  }
);

vanillaCommand.registerSubcommand("start", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = executeQueries(projectId, sessionId, "start mc-server", languageCode)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Start the mc-server"
  }
);

vanillaCommand.registerSubcommand("stop", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = executeQueries(projectId, sessionId, "stop mc-server", languageCode)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Stop the mc-server"
  }
);

const windowsCommand = bot.registerCommand("windows", (msg, args) => { // Make an echo command
    if(args.length === 0) { // If the user just typed "!echo", say "Invalid input"
      try {
        var res = executeQueries(projectId, sessionId, "Status windows", languageCode)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Make the bot say something",
    fullDescription: "The bot will echo whatever is after the command label.",
    reactionButtons: [ // Add reaction buttons to the command
      {
        emoji: "Ã¢â€žÂ¹Ã¯Â¸Â",
        type: "edit",
        response: (msg) => { // Reverse the message content
          try {
            var res = executeQueries(projectId, sessionId, "Status windows", languageCode)
          } catch (e) {
            return "ERROR"
          }

          return res;
        }
      },
      {
        emoji: "Ã¢â€“Â¶Ã¯Â¸Â",
        type: "edit",
        response: (msg) => { // Reverse the message content
          try {
            var res = executeQueries(projectId, sessionId, "start windows", languageCode)
          } catch (e) {
            return "FAILED TO START"
          }
          return res;
        }
      },
      {
        emoji: "Ã¢ÂÂ¹",
        type: "edit", // Pick a new pong variation
        response: (msg) => { // Reverse the message content
          try {
            var res = executeQueries(projectId, sessionId, "stop windows", languageCode)
          } catch (e) {
            return "FAILED TO STOP"
          }
          return res;
        }
      }
    ]
  }
);

windowsCommand.registerSubcommand("start", (msg, args) => { // Make a reverse subcommand under echo
  if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
    try {
      var res = executeQueries(projectId, sessionId, "start windows", languageCode)
    } catch (e) {
      return "ERROR"
    }
    return res;
  }
  return "stat";
},
{
  description: "Make the bot say something",
  fullDescription: "The bot will echo whatever is after the command label."
}
);

windowsCommand.registerSubcommand("stop", (msg, args) => { // Make a reverse subcommand under echo
  if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
    try {
      var res = executeQueries(projectId, sessionId, "stop windows", languageCode)
    } catch (e) {
      return "ERROR"
    }
    return res;
  }
});

bot.registerCommandAlias("mc", "vanilla");
bot.registerCommandAlias("pc", "windows");

bot.connect();