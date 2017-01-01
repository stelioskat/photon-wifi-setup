# photon-wifi-setup
Simple NodeJS/AngularJS for fast and easy Wifi setup of Particle Photon (https://docs.particle.io/reference/firmware/photon/).

## Installation

Just install the npm packages for the NodeJS server and the bower packages for the client AngularJS app.
In the root directory of the repo execute the following in a terminal:

```
npm install
cd client
bower install
```
   
## Usage
To start the app just enter in the root directory of the repository:

```
node .
```

Then open your web browser and visit *http://localhost:3000* . The app should automatically start searching for a Particle Photon that is in listening mode.
