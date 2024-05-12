// Global variable to store the PeerConnection instance
let peerConnection;

// Event handler for DOM content loaded, setting up event handlers and initial configurations
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('Document loaded and DOM fully initialized.');
    
    // Retrieve the 'name' query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
        // Display welcome message with the name if available
        document.getElementById('name-display').textContent = `Welcome, ${name}!`;
    }

    // Set up button event handlers
    document.getElementById('my-button').onclick = () => init(); // Initialize WebRTC connection when button is clicked
    document.getElementById('stop-stream').addEventListener('click', stopStreaming); // Stop the stream and close connection
     // Button to navigate back to the home page
    document.getElementById('go-home').addEventListener('click', () => {
        window.location.href = `https://nccuag.guideapp.uk`;
    });
});

// Stops the media stream and cleans up resources
function stopStreaming() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null; // Clear the peerConnection variable
        console.log('Peer connection closed.');
    }
    const audioElement = document.getElementById("audio");
    if (audioElement) {
        audioElement.srcObject = null;
        audioElement.load(); // Attempt to reload the audio element to reset
        console.log('Audio stream stopped and element reloaded.');
    }
}

// Initialize function to set up the WebRTC connection
async function init() {
    console.log('Initializing peer connection...');
    peerConnection = createPeer(); // Create a new RTCPeerConnection
    console.log('Adding transceiver for audio only...');
    peerConnection.addTransceiver("audio", { direction: "recvonly" }); // Specify as receiver only for audio
}

// Function to create and configure a new RTCPeerConnection
function createPeer() {
    console.log('Creating new RTCPeerConnection...');
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }] // Use a public STUN server
    });

    peer.ontrack = handleTrackEvent; // Set up handler for receiving media tracks
    peer.onnegotiationneeded = handleNegotiationNeeded; // Setup handler for negotiation needed event
    return peer;
}

// Function to handle the negotiation needed event
async function handleNegotiationNeeded() {
    console.log('Negotiation needed...');
    try {
        const offer = await peerConnection.createOffer(); // Create SDP offer
        console.log('Offer created:', offer);
        await peerConnection.setLocalDescription(offer); // Set local description with the created offer
        console.log('Local description set successfully.');

        const payload = { sdp: peerConnection.localDescription };
        console.log('Sending offer to server...');
        const response = await axios.post('/consumer', payload); // Send the offer to the server
        console.log('Offer sent, server response:', response);

        const desc = new RTCSessionDescription(response.data.sdp);
        await peerConnection.setRemoteDescription(desc); // Set remote description with the server's response
        console.log('Remote description set successfully.');
    } catch (error) {
        console.error('Failed to complete negotiation:', error);
    }
}

// Function to handle track events, which occur when media streams are received
function handleTrackEvent(e) {
    console.log('Track event received:', e);
    const audioElement = document.getElementById("audio");
    if (audioElement && e.streams[0]) {
        e.streams[0].getTracks().forEach(track => {
            if (track.kind === 'audio') {
                console.log('Adding audio track to audio element.');
                checkTrackState(track); // Check track state for events
                audioElement.srcObject = new MediaStream([track]);
                audioElement.play()
                    .then(() => console.log('Audio is playing'))
                    .catch(err => console.error('Error attempting to play audio:', err.message));
            }
        });
    } else {
        console.error('Audio element not found in the document.');
    }
}

// Function to check and log track state events
function checkTrackState(track) {
    track.onmute = () => console.log('Track is muted.');
    track.onunmute = () => console.log('Track is unmuted.');
    track.onended = () => console.log('Track has ended.');
}
