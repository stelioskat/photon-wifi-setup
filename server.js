var express = require('express');
var bodyParser = require('body-parser')
var RSA = require('node-rsa')
var WiFiControl = require('wifi-control');

WiFiControl.init( settings );
var settings = {
    debug: true,
    iface: 'wlan0',
    connectionTimeout: 10000 // in ms 
  };

setInterval(function(){wifiCheck()}, 5000);
wifiCheck()

function wifiCheck() {
	
	// Check if already connected with a Photon
	var ifaceState = WiFiControl.getIfaceState();
	console.log(ifaceState)
	if (ifaceState.connection == 'connected' && ifaceState.ssid.search("Photon-") == 0) {
		return
	}
	
	WiFiControl.scanForWiFi( function(err, response) {
    if (err) console.log(err);
    if (response.success) {
    	for (ap in response.networks) {
    		if (response.networks[ap].ssid.search("Photon-") == 0) {
    			var results = WiFiControl.connectToAP( {ssid: response.networks[ap].ssid}, function(err, response) {
    				if (err) console.log(err);
    					console.log(response);
  				});
  				return;
    		}	
    	}

    }
  });
}

var app = express();
app.use(express.static('client'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.post('/encrypt', function (req, res) {
	var pwd = req.body.pwd
	var pubKey = req.body.pubKey
	
	var buff = new Buffer(pubKey, 'hex');
		pubKey = new RSA(buff.slice(22), 'pkcs1-public-der', {
			encryptionScheme: 'pkcs1'
		});
		pwd = pubKey.encrypt(pwd, 'hex');
	
  	res.end(pwd);
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
