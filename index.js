let http = require('http')
let request = require('request')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

http.createServer((req, res) => {
  req.pipe(res)
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
}).listen(8000)

http.createServer((req, res) => {
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
  req.pipe(logStream, {end: false})

  let downstreamResponse = req.pipe(request(options))
  process.stdout.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(process.stdout)
  downstreamResponse.pipe(res)
}).listen(8001)