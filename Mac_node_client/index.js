const SmeeClient = require('smee-client')
const express = require('express')
const { exec } = require('child_process')


// Read smee client url from Environment variable SME_URL 
SME_URL = process.env.SME_URL

// Read smee client URL from environment variable SME_URL, if blank, use the default URL
if (SME_URL == null || SME_URL == "") {
    SME_URL = "https://smee.io/xxxxxxxxxxxxxx"
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
    // run cli command in current directory 'afplay -t 5 ../builtthis.mp3'
    exec('afplay -t 5 ../builtthis.mp3', (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command to play the sound
            console.log(err)
            return;
        }
    })

    console.log(req.body)
    res.send('OK')
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
