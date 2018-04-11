var express = require('express');
var cors = require('cors');
var basicAuth = require('express-basic-auth');

var app = express();
var static = express.static(__dirname);

app.listen(8000, function() {
    console.log('CORS-enabled web server listening on port 8000 running in ' + __dirname)
})

var staticUserAuth = basicAuth({
    users: {
        'vlabs': 'q1w2e3r4t5'
    },
    challenge: false
})


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.get(/\/auth/, function( req, res ) {
    return res.sendStatus(200);
});
app.get(/\.(jpg|jpeg|png|gif)$/, static);
app.get(/^(?!.*[.](jpg|jpeg|png|gif)$).*$/, staticUserAuth, static);
