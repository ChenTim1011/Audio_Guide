// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const QRCode = require('qrcode');

// Create an instance of an Express application
const app = express();

// Variable to store the media stream from the broadcaster
let senderStream;

// Configure the Express application
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.json()); // Parse JSON-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Route handler for GET requests to the root path, serves the index.html file
app.get('/', (req, res) => {
    console.log('Root path accessed.');
    res.sendFile(__dirname + '/public/index.html');
});

// Route handler for generating QR code
app.get('/generate-qrcode', (req, res) => {
    const qrCodeOptions = {
        margin: 1,
        width: 200,
        color: {
            dark: '#000000',  // Black dots
            light: '#FFFFFF'  // White background
        }
    };

    QRCode.toFileStream(res, 'https://nccuag.guideapp.uk', qrCodeOptions, (err) => {
        if (err) {
            console.error('Error generating QR Code', err);
            return res.status(500).send('Error generating QR Code');
        }
    });
    res.type('png'); // Set response type to PNG
});

// Route handler for POST requests from consumers who want to connect
app.post("/consumer", async ({ body }, res) => {
    try {
        if (!senderStream) {
            return res.status(400).send('No active broadcast stream.');
        }

        const peer = new webrtc.RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
        });

        const desc = new webrtc.RTCSessionDescription(body.sdp);
        await peer.setRemoteDescription(desc);
        senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        res.json({ sdp: peer.localDescription });
    } catch (error) {
        console.error('Error in /consumer route:', error);
        res.status(500).send('Error connecting to consumer.');
    }
});

// Route handler for POST requests to handle media stream broadcasting
app.post('/broadcast', async ({ body }, res) => {
    try {
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
        });

        peer.ontrack = (e) => handleTrackEvent(e, peer);
        const desc = new webrtc.RTCSessionDescription(body.sdp);
        await peer.setRemoteDescription(desc);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        res.json({ sdp: peer.localDescription });
    } catch (error) {
        console.error('Error in /broadcast route:', error);
        res.status(500).send('Error setting up broadcast.');
    }
});
// Event handler for 'ontrack' event, used to handle received media streams
function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
    console.log('Received remote stream:', senderStream.id);
};

// Define server port number
const port = 5000;

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});
