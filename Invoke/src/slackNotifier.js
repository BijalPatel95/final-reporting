require('dotenv').config();
const fetch = require ('node-fetch');

exports.notifyError = async function(error) {
    try{
         let response = await fetch(process.env.slackWebhook, {
             "method": "POST",
             "body": JSON.stringify({
                 "channel": process.env.slackChannel,
                 "username": process.env.slackUsername,
                 "text": error
             })
         }); 
        
         if(!response.ok){
            console.error("Slack Fetch failed....slack realtime communications satellite failure"); 
            throw new Error("Slack Fetch failed....");
         }
    }catch(e){
        console.log(`Exception ${e.message}`);
    }
};
