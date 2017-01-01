app.controller('Home', ['$scope', '$state', '$http', function($scope, $state, $http) {
	$scope.deviceId = ""
	$scope.connError = false;
	$scope.showPwd = false
	$scope.pubKey = ""
	var securityTable = {
		open: 0,
		none: 0,
		wep_psk: 1,
		wep_shared: 0x8001,
		wpa_tkip: 0x00200002,
		wpa_aes: 0x00200004,
		wpa2_aes: 0x00400004,
		wpa2_tkip: 0x00400002,
		wpa2_mixed: 0x00400006,
		wpa2: 0x00400006
	};
	
	$scope.secToString = {}
	$scope.secToString[0] = "None";
	$scope.secToString[1] = "WEP/PSK";
	$scope.secToString[0x8001] = "WEP/SHARED";
	$scope.secToString[0x00200002] = "WPA/TKIP";
	$scope.secToString[0x00200004] = "WPA/AES";
	$scope.secToString[0x00400004] = "WPA2/AES";
	$scope.secToString[0x00400002] = "WPA2/TKIP";
	$scope.secToString[0x00400006] = "WPA2";
	$scope.secToString[0x02400004] = "WPA2 Enterprise";

	

	deviceId()
	scanAP()

	function deviceId() {

		$http({
				  method: 'GET',
				  url: 'http://192.168.0.1/device-id',
				  processData: false,
				  timeout: 4000
				  })
			.then(function(res) {
				  $scope.deviceId = res.data.id
				  $scope.connError = false;	
				  	pubKey()	
				  	var idInterv = setTimeout(function(){ deviceId() }, 4000);
				  }, function(err) {
				  	console.error(err)
				  	$scope.connError = true;
				  	
				  	var idInterv = setTimeout(function(){ deviceId() }, 3000);
				  }
			)
	}
	
	
	function scanAP() {
		if(		$scope.connError ) {
			setTimeout(function(){ scanAP() }, 3000);
			return;
		}

		$http({
			  method: 'GET',
			  url: 'http://192.168.0.1/scan-ap',
			  processData: false
			  })
		.then(function(res) {
			  $scope.accesspoints = res.data.scans
			  	setTimeout(function(){ scanAP() }, 10000);
			  	$scope.connError = false;
			  	console.log(res)
			  }, function(err) {
			  	console.error(err)
			  	setTimeout(function(){ scanAP() }, 1000);
			  	$scope.connError = true;
			  })
	}
	
	function pubKey() {
		$http({
			  method: 'GET',
			  url: 'http://192.168.0.1/public-key',
			  processData: false
			  })
		.then(function(res) {
			  	console.log(res)
			  	$scope.pubKey = res.data.b
			  }, function(err) {
			  	console.error(err)
			  })
	}
		
		
		
		
	function configure(opts) {				
		var securePass = undefined;
		if (!$scope.pubKey) {
			throw new Error('Must retrieve public key of device prior to AP configuration');
		}
		if (!opts || typeof opts !== 'object') {
			throw new Error('Missing configuration options object as first parameter');
		}
		if (!$scope.ssid) {
			if (!opts.name) {
				throw new Error('Configuration options contain no ssid property');
			}
			opts.ssid = opts.name;
		}
		if ((opts.enc || opts.sec) && !opts.security) {
			opts.security = opts.sec || opts.enc;
		}
		if (!opts.security) {
			opts.security = 'open';
			opts.password = null;
		}
		if (opts.password || opts.pass) {
			if (!opts.security) {
				throw new Error('Password provided but no security type specified');
			}
			if (opts.pass && !opts.password) {
				opts.password = opts.pass;
			}
		
			securePass = opts.pass
		}
		if (typeof opts.security === 'string') {
			opts.security = securityTable[opts.security];
		}
		
		var apConfig = {
			idx: opts.index || 0,
			ssid: opts.ssid,
			sec: opts.security,
			ch: parseInt(opts.channel) 
		};
		
		if (securePass) {
			apConfig.pwd = securePass;
		}
		
		payload = JSON.stringify(apConfig);
		hdr = {
					'Content-Type': 'application/x-www-form-urlencoded'
		};
		console.log("Configuring...")
		console.log(payload)
		$http({
					method: 'POST',
					url: 'http://192.168.0.1/configure-ap',
					data: payload,
					headers: hdr
					  	})
		.then(function (res) {
				console.log("Configuration Done");
			  	console.log(res)
			  	
			  	
			  	console.log("Connecting")
			
					  	$http({
							  method: 'POST',
							  url: 'http://192.168.0.1/connect-ap',
							  data: JSON.stringify({idx: apConfig.idx}),
							  headers: hdr
					  	})
						.then(function(res) {
					  		console.log(res)
					  	}, function(err) {
					  		console.error(err)
					  	})
			  }, function(err){
			  	console.log(err)
			  })
}
	
	
	
	$scope.setSSID = function(ssid, sec, ch) {
		$scope.ssid = ssid
		$scope.sec = sec
		$scope.channel = ch
		$scope.showPwd = true
	}

	$scope.connect = function( ){
		var data = {pwd: $scope.pwd, pubKey: $scope.pubKey}
		
		$http({
		 method: 'POST',
			  url: 'http://localhost:3000/encrypt',
			  data
			  })
				.then(function(res) {
				  	console.log(res)
				  	opts = {
						ssid: $scope.ssid,
						pass: res.data,
						sec: $scope.sec,
						channel: $scope.channel
					}
			  		configure(opts)
			  }, function(err) {
			  		console.error(err)
			  })
		
	}	
}]);
