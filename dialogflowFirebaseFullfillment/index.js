// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var Compute = require('@google-cloud/compute');
var compute = new Compute();



process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function toggleServer(agent){
    agent.add(`Toggle`);

  }

  function activateServer(agent){
    console.log(agent.parameters);
    var {servers} = agent.parameters;
    var zone = compute.zone('us-east1-b');
    var vm = zone.vm(servers);
    vm.start(function(err, operation, apiResponse) {
      console.log('instance start successfully');
    });
    agent.add(`Booting up ${servers}`);
  }

  function deactivateServer(agent){
    console.log(agent.parameters);
    var {servers} = agent.parameters;
    var zone = compute.zone('us-east1-b');
    var vm = zone.vm(servers);
    vm.stop(function(err, operation, apiResponse) {
      console.log('instance stopped successfully');
    });
    agent.add(`Shutting down ${servers}`);
  }

  console.log("Check");
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }


async function listVMs() {
  const vms = await compute.getVMs({
    maxResults: 1000,
  });
  console.log(`Found ${vms.length} VMs!`);
  var str = "";
  for(let vm of vms[0])
    str += `${vm.metadata.name}  ${vm.metadata.status}  ${ vm.metadata.networkInterfaces[0].accessConfigs[0].natIP || ' ' }\n`
  
	agent.add(str);
}

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Server-toggle', toggleServer);
  intentMap.set('Server-on', activateServer);
  intentMap.set('Server-off', deactivateServer);
  intentMap.set('Server-list', listVMs);

  agent.handleRequest(intentMap);
});

