let http = require('http')
let https = require('https')
let request = require('request')
let fs = require('fs')
let argv = require('yargs')
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
    
let options = {
    headers: req.headers,
    url: destUrl
}
  process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
  logStream.write('Request headers: ' + JSON.stringify(req.headers))
  req.pipe(logStream, {end: false})
  let downstreamResponse = req.pipe(request(options))
  process.stdout.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(process.stdout)
  downstreamResponse.pipe(res)
  
}).listen(8001)