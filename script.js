/*
  QR Code generator and MQTT sender

  Draws a QR code using a text string. The QR code is the sketch's 
  URL. Also sends an MQTT message to shiftr.io.
  
  Uses 
  https://github.com/kazuhikoarase/qrcode-generator
  as the QR Code generator library. It's hosted at this CDN:
  https://unpkg.com/qrcode-generator@1.4.4/qrcode.js

  created 22 Aug 2020
  modified 23 Nov 2020
  by Tom Igoe
*/

// a string to d isplay in the QR code
// (the URL of this sketch):
let urlString = parent.location.href;
// an HTML div to display it in:
let tagDiv;
let timeNOW;

// MQTT broker details:

let broker = {
    hostname: 'voruin.cloud.shiftr.io',
    port: 443
};

// let broker = {
//     hostname: 'public.cloud.shiftr.io',
//     port: 443
// };


// MQTT client:
let client;
// client credentials:

let creds = {
    clientID: 'waitingRoomQRClient',
    userName: 'voruin',
    password: 'lettherebelight'
}

// let creds = {
//     clientID: 'waitingRoomQRClient',
//     userName: 'public',
//     password: 'public'
// }

// topic to subscribe to when you connect:
let topic = 'lights';

// a pushbutton to send messages
let sendButton;
// divs for the local and remote messages:
// let localDiv;
// let remoteDiv;

// message to send, affecting the brightness of a light:
let brightness = 0;

function setup() {
    updateTime();
    // createCanvas(windowWidth, windowHeight);
    noCanvas();
    // make the HTML tag div:
    tagDiv = createDiv();
    // make the QR code:
    let qr = qrcode(0, 'L');
    qr.addData(urlString);
    qr.make();
    // create an image from it:
    let qrImg = qr.createImgTag(2, 8, "qr code");
    // put the image and the URL string into the HTML div:
    tagDiv.html(qrImg);
    // position it:
    tagDiv.position(30, 500);
    // set a callback function for clicking on the tag:
    tagDiv.mousePressed(hideTag);
    createCanvas(30, 400);
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
    // set callback handlers for the client:
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: onConnect,       // callback function for when you connect
            userName: creds.userName,   // username
            password: creds.password,   // password
            useSSL: true                // use SSL
        }
    );
    // create the send button:
    // sendButton = createButton('Submit');
    // sendButton.position(20, 150);
    let button = document.getElementById("sendButton");
    button.addEventListener('mouseup', sendMqttMessage);
    button.addEventListener('mousedown', buttonPressed);

    // sendButton.mousePressed(sendMqttMessage);
    // document.getElementById("sendButton").mousePressed(sendMqttMessage);
    // create a div for local messages:
    // localDiv = document.getElementById("sentMessage");
    // localDiv.innerHTML = 'local messages will go here';
//     localDiv = createDiv('local messages will go here');
//     localDiv.position(30, 400);
    // create a div for the response:
    // remoteDiv = document.getElementById("gotMessage");
    // remoteDiv.innerHTML = 'waiting for messages';
//     remoteDiv = createDiv('waiting for messages');
//     remoteDiv.position(30, 430);

    let secondToHide = document.getElementsByClassName("loading-dots");
    for (var i = 0; i < secondToHide.length; i++) {
        // divsToHide[i].style.visibility = "hidden"; // or
        secondToHide[i].style.display = "none"; // depending on what you're doing
    }
}

function draw() {

}

// This function hides the tag div when you click on it:
function hideTag() {
    tagDiv.hide();
}

// called when the client connects
function onConnect() {
//     localDiv.html('client is connected');
    client.subscribe(topic);
}

// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        // let connectionInfo= String('onConnectionLost:' + response.errorMessage);
        // localDiv.innerHTML = connectionInfo;
//         localDiv.html('onConnectionLost:' + response.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    // let gotShow= String('I got a message:' + message.payloadString);
    // remoteDiv.innerHTML = gotShow;
//     remoteDiv.html('I got a message:' + message.payloadString);
    // let incomingNumber = parseInt(message.payloadString);
    // invert the message each time: 0, then 254, then 0, etc.:
    // if (incomingNumber > 0) {
    //     brightness = 0;
    // } else {
    //     brightness = 254;
    // }
}

// called when you want to send a message:
function sendMqttMessage() {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
        // make a string with a random number form 0 to 15:
        let patientName = document.getElementById("fname").value + " " + document.getElementById("lname").value;
        let doctor = document.getElementById("doctorName").value;
        let reservationTime = document.getElementById("appt").value;

        let randomColorHEX = Math.floor(Math.random() * 16777215).toString(16);
        let colorDiv = document.getElementById("individualColor");
        colorDiv.style.backgroundColor = "#" + randomColorHEX;

        let randomColor = [hexToRgb(randomColorHEX).r, hexToRgb(randomColorHEX).g, hexToRgb(randomColorHEX).b];
        let randomColorHSV = [rgb2hsv(hexToRgb(randomColorHEX).r, hexToRgb(randomColorHEX).g, hexToRgb(randomColorHEX).b).h,rgb2hsv(hexToRgb(randomColorHEX).r, hexToRgb(randomColorHEX).g, hexToRgb(randomColorHEX).b).s,rgb2hsv(hexToRgb(randomColorHEX).r, hexToRgb(randomColorHEX).g, hexToRgb(randomColorHEX).b).v];

        // color.innerHTML = "#" + randomColorHEX;


        let msg = JSON.stringify({ "name": patientName, "doctor": doctor, "apptTime": reservationTime, "subTime": timeNow, "color": randomColorHSV });
        //   let msg = String(brightness);

        // start an MQTT message:
        message = new Paho.MQTT.Message(msg);
        // choose the destination topic:
        message.destinationName = topic;
        // send it:
        client.send(message);
        // print what you sent:
//         localDiv.html('I sent: ' + message.payloadString);
        // let sentShow= String('I sent: ' + message.payloadString);
        // localDiv.innerHTML = sentShow;
        let divsToHide = document.getElementsByClassName("pageOne");
        for (var i = 0; i < divsToHide.length; i++) {
            // divsToHide[i].style.visibility = "hidden"; // or
            divsToHide[i].style.display = "none"; // depending on what you're doing
        }
        let buttonToHide = document.getElementById("sendButton");
        buttonToHide.style.display = "none";

        let secondToShow = document.getElementsByClassName("loading-dots");
        for (var i = 0; i < secondToShow.length; i++) {
            // divsToHide[i].style.visibility = "hidden"; // or
            secondToShow[i].style.display = "initial"; // depending on what you're doing
        }
        let dotsColor1 = document.getElementById("dot_one");
        dotsColor1.style.color = "#" + randomColorHEX;
        let dotsColor2 = document.getElementById("dot_two");
        dotsColor2.style.color = "#" + randomColorHEX;
        let dotsColor3 = document.getElementById("dot_three");
        dotsColor3.style.color = "#" + randomColorHEX;

    }

}

function updateTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    timeNow = h + ":" + m + ":" + s;
    var timeToShow = h + ":" + m;
    document.getElementById("appt").value = timeToShow;
}


// function hexToRgb(hex) {
//     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//     return result ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16)
//     } : null;
// }

function buttonPressed() {
    let buttonToChange = document.getElementById("sendButton");
    buttonToChange.style.background = "#e058a7";
    buttonToChange.style.color = "#ffffff";
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return {
        r: r,
        g: g,
        b: b
    }
}
function rgb2hsv(r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: int(Math.round(h * 360)),
        s: int(percentRoundFn(s * 100)),
        v: int(percentRoundFn(v * 100))
    };
}
