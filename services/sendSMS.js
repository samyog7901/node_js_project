const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

async function sendSMS(){
   await twilio.messages.create({
        body : "Testing SMS in nodejs",
        to : "+977 9844646847"       
    })
    console.log("SMS sent!");
    
}

module.exports = sendSMS