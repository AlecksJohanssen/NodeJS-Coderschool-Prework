let http = require('http')
let https = require('https')
let request = require('request')
let fs = require('fs')
let argv = require('yargs')
		.help('h')
    .alias('h', 'help')
		.describe('Proxy', 'Use for forwards a request on to a destination server')
		.describe('Echo', 'Use for echoes our requests back to us')
    .epilog('Copyright CoderSchool & Alecks Johanssen 2016')
 		.default('loglevel', '2')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'https://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let httpsOption = {
		key: fs.readFileSync('client-key.pem'),
		cert: fs.readFileSync('client-cert.pem')
}

https.createServer(httpsOption, function(req, res) {
  req.pipe(res)
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
}).listen(8000)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

https.createServer(httpsOption, function(req, res) {
let destUrl = destinationUrl
  if (req.headers['x-destination-url']) {
    destUrl = req.headers['x-destination-url']
  } else {
    destUrl = destinationUrl + req.url
  }

let logLevelEnum = {
		VERBOSE : 0,
		DEBUG : 1,
		INFO : 2,
		WARN : 3,
		ERROR : 4	
}		
		
let options = {
    headers: req.headers,
    url: destUrl
}

function log(level, msg) {
		if (logLevelEnum >= argv.loglevel) {
				logStream.write(level + msg)
				console.log("Logged out")
		} 
		
}
  process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
  log('Request headers: ' + JSON.stringify(req.headers), 'info')
  req.pipe(logStream, {end: false})
  let downstreamResponse = req.pipe(request(options))
  process.stdout.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(process.stdout)
  downstreamResponse.pipe(res)
  
}).listen(8001)