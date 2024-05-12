// Global variable to store the media stream
let globalStream = null;

// Function to initialize the media capture and WebRTC connection
async function init() {
    // Request access to the user's audio stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    globalStream = stream; // Save the stream to a global variable
    // Set the obtained stream as the source for the audio element on the web page
    document.getElementById("audio").srcObject = stream;
    // Create a WebRTC peer connection
    const peer = createPeer();
    // Add all tracks from the stream (audio) to the peer connection
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}

// Function to create a configured WebRTC peer connection
function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [ // Configuration for ICE servers to handle NAT traversal
            {
                urls: "stun:stun.stunprotocol.org" // Using a public STUN server
            }
        ]
    });
    // Event handler for negotiation needed event
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
    return peer; // Return the created peer connection
}

// Function to handle the negotiation needed event
async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer(); // Create an SDP offer
    await peer.setLocalDescription(offer); // Set the offer as the local description
    // Prepare to send the offer to the server
    const payload = { sdp: peer.localDescription };
    // Send the offer to the server via HTTP POST request to '/broadcast' route
    const { data } = await axios.post('/broadcast', payload);
    // Set the SDP answer from the server as the remote description
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.error('Failed to set remote description:', e));
}

// Event listeners setup on window load
window.onload = () => {
    // Button to start the media stream
    document.getElementById('my-button').onclick = () => init();

    // Button to stop the media stream and clear the audio element
    document.getElementById('stop-stream').addEventListener('click', () => {
        if (globalStream) {
            globalStream.getTracks().forEach(track => track.stop());
            document.getElementById("audio").srcObject = null;
        }
    });

    // Button to navigate back to the home page
    document.getElementById('go-home').addEventListener('click', () => {
        window.location.href = `https://nccuag.guideapp.uk`;
    });
};

