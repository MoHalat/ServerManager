const dialogflow = require('dialogflow');
const eris = require('eris');
const Compute = require('@google-cloud/compute');

const sessionClient = new dialogflow.SessionsClient();
const config = require('./config.json');
const projectId = config.project_id;
const sessionId = config.id;
const languageCode = config.language;

const compute = new Compute();
const bot = new eris.Client(config.discord.token);

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
  console.log('Connected and ready. V0.8');
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
    responses = `${intentResponse.queryResult.fulfillmentText}`;
    // Use the context from this response for next queries
    context = intentResponse.queryResult.outputContexts;
  } catch (error) {
    console.log(error);
  }

  return responses
}

bot.on('messageCreate', async (msg) => {

  try{
    var botWasMentioned = msg.mentions.find(mentionedUser => mentionedUser.id === bot.user.id,);
    if (botWasMentioned){
      content = msg.content.toString().toLowerCase().replace("<@!685821709206421504>", "")
      try {
        var res = await executeQueries(projectId, sessionId, content, languageCode);
        await msg.channel.createMessage(res);
      } catch (e) {
        console.log(e);
        await msg.channel.createMessage("Sorry, I'm not sure I got that");
      }

    }

    } catch (err) {
      console.warn('Failed to respond to mention.');
      console.error(err);
      if (botWasMentioned) await msg.channel.createMessage('There seems to have been a problem.');
    }
});

bot.on('error', err => {
  console.warn(err);
});

bot.connect();
