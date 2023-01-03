const SmeeClient = require('smee-client')
const express = require('express')
const { exec } = require('child_process')

function playMP3(mp3Path){
    exec("afplay -t 5 ${mp3Path}", (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command to play the sound
            console.log(err)
            return;
        }
    })
}

// Function that takes a JSON payload and filters it. Then returns a smaller json payload containing just 4 items
function filterPayload(payload){

    if (payload.payload == null){
        console.log('Payload is null')
        return
    }

    if (payload.payload.payload == null){
        console.log('Payload.payload is null')
        return
    }

    if (payload.payload.action == null){
        console.log('No action in payload')
        return
    }

    if (payload.payload.action != "completed"){
        console.log('Action is ${payload.payload.action} ignoring it')
        return
    }

    if (payload.payload.payload.workflow_run == null){
        console.log('Payload.payload.workflow_run is null')
        return
    }

    //console.log(typeof(payload.payload.payload))
    // json parse the object in payload.payload.workflow_run
    const innerPayload = JSON.parse(payload.payload.payload)
    // filter the payload to only include the following items
    const filteredPayload = {
        "conclusion": innerPayload.workflow_run.conclusion,
        "name": innerPayload.workflow_run.name,
        "status": innerPayload.workflow_run.status
        // "status": payload.payload.workflow_run.status,
        // "conclusion": payload.payload.workflow_run.conclusion,
        // "name": payload.payload.workflow_run.name
    }

    if(filteredPayload.conclusion == "success" && filteredPayload.name == "Build" && filteredPayload.status == "completed") {
        playMP3("../builtthis.mp3")
    }else if(filteredPayload.conclusion == "fail" && filteredPayload.name == "Build" && filteredPayload.status == "completed"){
        playMP3("../fail.mp3")
    }
    return 
}



// Read smee client url from Environment variable SME_URL 
SME_URL = process.env.SME_URL

// Read smee client URL from environment variable SME_URL, if blank, use the default URL
if (SME_URL == null || SME_URL == "") {
    SME_URL = "https://smee.io/XXXXXXXXXX"
}

// Read localhost url from Environment variable LOCAL_URL
//const LOCAL_URL = process.env.LOCAL_URL.toString()
const LOCAL_URL = "http://localhost:3000/webhook"

const smee = new SmeeClient({
    source: SME_URL,
    target: LOCAL_URL,
    logger: console
})

// Start the client asynchronously
const events = smee.start()

// start express server listening to port 3000 and listening for a post request on /webhook
const app = express()
app.use(express.json())
app.post('/webhook', (req, res) => {
    console.log(req.body)
    res.send('OK')

    // filter the payload
   filterPayload(req.body)

    // console.log('Payload filtered to: ')
    // console.log(filteredPayload)
    // console.log('END filtered payload')

    // if(filteredPayload.conclusion == "success" && filteredPayload.name == "Build" && filteredPayload.status == "completed") {
    //     //run cli command in current directory 'afplay -t 5 ../builtthis.mp3'
    //     exec('afplay -t 5 ../builtthis.mp3', (err, stdout, stderr) => {
    //         if (err) {
    //             // node couldn't execute the command to play the sound
    //             console.log(err)
    //             return;
    //         }
    //     })
    // }else if(filteredPayload.conclusion == "fail" && filteredPayload.name == "Build" && filteredPayload.status == "completed"){
    //     exec('afplay -t 5 ../fail.mp3', (err, stdout, stderr) => {
    //         if (err) {
    //             // node couldn't execute the command to play the sound
    //             console.log(err)
    //             return;
    //         }
    //     })
    // }
})
app.listen(3000, () => console.log('Listening on port 3000'))


// listen for ctrl+d event
process.stdin.resume()
process.on('SIGINT', function () {
    console.log('Ctrl+C pressed. Stopping smee client')
    events.close()
    app.close()
    process.exit(0)
})
