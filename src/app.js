var options = {
    port: 13382,
    host: 'mqtt://farmer.cloudmqtt.com',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'wss',
    password: 'wss',
};
const express = require('express'),
    app = express(),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mqtt = require('mqtt'),
    mqttClient = mqtt.connect('mqtt://farmer.cloudmqtt.com:13382', options),
    mqttTopic = '/meters/pi-1/teleinfo',
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var streamInterval;
var msFrequency = 20;

/* 
Subscribe (listen) to MQTT topic and start publishing
simulated data after successful MQTT connection 
*/
mqttClient.on('connect', () => {
    console.log('Mqtt connected.')
    mqttClient.subscribe(mqttTopic); //subscribe
    //startStreamSimulation(); //publish
})

mqttClient.on('offline', () => {
    console.log('Mqtt offline.')
    mqttClient.unsubscribe(mqttTopic);
    clearInterval(streamInterval);
})

/* 
Message event fires, when new messages
arrive on the subscribed topic
*/
mqttClient.on('message', function (topic, message) {
    console.log('Received: ' + message.toString() + ' from topic: ' + topic.toString());
    let parsedMessage = JSON.parse(message);
    io.emit('trame', parsedMessage);
})

function returnRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

io.on('connection', (client) => {
    console.log("Socket connected.")
})

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.get('/', function (req, res) {
    res.send(
    [{
            title: "Hi, I'm the express server!",
            description: "Start Moquette and the client application to see the action!"
    }]
    )
});

server.listen(3000, function () {
    console.log('App listening on port 3000!');
});
