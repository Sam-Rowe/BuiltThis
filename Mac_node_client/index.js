const SmeeClient = require('smee-client')


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


// listen for ctrl+d event
process.stdin.resume()
process.on('SIGINT', function () {
    console.log('Ctrl+C pressed. Stopping smee client')
    events.close()
    process.exit(0)
})
