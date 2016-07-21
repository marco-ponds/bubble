var CHUNK_SIZE = 10 * 1024 * 1024, // 10MB
    BUFFER = new Buffer(CHUNK_SIZE),
    PORT = 3000,
    IP = {},
    INTERNALS = {},
    EXPLORE_INTERVAL = 0,
    EXPLORE_TIME = 10000;

var fs = require('fs'),
    dns = require('dns'),
    http = require('http'),
    os = require('os'),
    app = require('express')(),
    server = http.Server(app),
    io = require('socket.io')(server),
    ioc = require('socket.io-client');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket) {

  socket.on('explore', function() {
    // someone is exploring, sending ip and name?
  });

  socket.on('file', function() {
    // someone is sending me a file
  })

  socket.on('disconnect', function() {
    // user disconnected
  })
});

app.listen(PORT, function(){
  console.log('listening on *:3000');
});


// retrieving ip
function getMyIp() {
  var networks = os.networkInterfaces();
  for (var i in networks) {
    var interface = networks[i];
    for (var k in interface) {
      var address = interface[k];
      if ((address.family == 'IPv4' || address.family == 'IPv6') && !address.internal.address) {
          IP[address.family] = {
            'ip': address.address,
            'mask': address.netmask
          }
      }
    }
  }
}


// exploring every 10 seconds?
EXPLORE_INTERVAL = setInterval(function() {
  // assuming mask is 255.255.255.0
  // @TODO changing ips for explore using mask
  for (var i=0; i<256; i++) {

  }
}, EXPLORE_TIME);

// reading file and sending to socket?
function sendFile(path, socket) {
  fs.open(path, 'r', function(err, fd) {
    if (err) throw err;
    function readNextChunk() {
      fs.read(fd, BUFFER, 0, CHUNK_SIZE, null, function(err, nread) {
        if (err) throw err;

        if (nread === 0) {
          // done reading file

          // maybe closing connection?

          fs.close(fd, function(err) {
            if (err) throw err;
          });
          return;
        }

        var data;
        if (nread < CHUNK_SIZE) {
            data = BUFFER.slice(0, nread);
        } else {
          data = BUFFER;
        }
        console.log(data);
        // do something with `data`, then call `readNextChunk();`
      });
    }
    readNextChunk();
  });
}
