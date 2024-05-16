// Global variable to store the PeerConnection instance
let peerConnection;
let globalStream = null;
let mediaRecorder;
let recordedBlobs = [];
let mimeType; // Global variable to store the mimeType

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
    document.getElementById('my-button').onclick = toggleListening;
    document.getElementById('record-button').onclick = toggleRecording;
    document.getElementById('go-home').addEventListener('click', () => {
        window.location.href = `https://nccuag.guideapp.uk`;
    });

    // Set up play and download recording buttons
    document.getElementById('play').addEventListener('click', playRecording);
    document.getElementById('download').addEventListener('click', downloadRecording);
});

// Function to toggle listening state
async function toggleListening() {
    const button = document.getElementById('my-button');
    if (button.textContent === '收聽直播') {
        const hasLiveStream = await checkLiveStream();
        if (hasLiveStream) {
            button.textContent = '收聽中...';
            await init();
            button.textContent = '停止收聽';
        } else {
            alert('目前沒有直播可供收聽。');
        }
    } else {
        stopStreaming();
        button.textContent = '收聽直播';
    }
}

// Function to check if there is a live stream
async function checkLiveStream() {
    try {
        const response = await axios.get('/check-live-stream');
        return response.data.isLive;
    } catch (error) {
        console.error('Error checking live stream:', error);
        return false;
    }
}

// Function to toggle recording state
function toggleRecording() {
    const button = document.getElementById('record-button');
    if (button.textContent === '開始錄音') {
        startRecording();
        button.textContent = '錄音中...';
    } else {
        stopRecording();
        button.textContent = '開始錄音';
    }
}

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
        globalStream = e.streams[0]; // Save the stream to a global variable
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

// Function to detect browser type
function getBrowserType() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
        return 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
        return 'Safari';
    }
    return 'Other';
}

// Function to get supported MIME types for recording
function getSupportedMimeTypes() {
    const browser = getBrowserType();
    if (browser === 'Chrome') {
        return [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus'
        ];
    } else if (browser === 'Safari') {
        return [
            'audio/mp4',
            'audio/aac'
        ];
    }
    return [];
}

// Recording functions
async function startRecording() {
    recordedBlobs = []; // Clear previous recordings
    const supportedMimeTypes = getSupportedMimeTypes();
    let options = {};

    if (supportedMimeTypes.length === 0) {
        console.error('No supported MIME types for MediaRecorder.');
        document.querySelector('span#errorMsg').textContent = 'No supported MIME types for MediaRecorder.';
        return;
    }

    // Try to use the first supported MIME type
    options.mimeType = supportedMimeTypes[0];
    mimeType = options.mimeType; // Save the mimeType globally

    try {
        mediaRecorder = new MediaRecorder(globalStream, options);
    } catch (e) {
        console.warn(`Exception while creating MediaRecorder with ${options.mimeType}:`, e);
        document.querySelector('span#errorMsg').textContent = `Exception while creating MediaRecorder: ${e.toString()}`;
        
        // Try using the next supported MIME type if available
        for (let i = 1; i < supportedMimeTypes.length; i++) {
            options.mimeType = supportedMimeTypes[i];
            mimeType = options.mimeType; // Save the mimeType globally
            try {
                mediaRecorder = new MediaRecorder(globalStream, options);
                break; // Success, exit the loop
            } catch (e) {
                console.warn(`Exception while creating MediaRecorder with ${options.mimeType}:`, e);
                document.querySelector('span#errorMsg').textContent = `Exception while creating MediaRecorder: ${e.toString()}`;
            }
        }

        // If still no valid mediaRecorder, return
        if (!mediaRecorder) {
            console.error('Failed to create MediaRecorder with any supported MIME type.');
            return;
        }
    }

    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
        document.getElementById('record-button').textContent = '開始錄音';
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
}

// Function to stop recording audio
function stopRecording() {
    console.log('Stopping recording...');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
        console.log('Data available: ', event.data);
    }
}

function playRecording() {
    const superBuffer = new Blob(recordedBlobs, { type: mimeType }); // Use the global mimeType
    const recordedAudio = document.getElementById('recorded');
    recordedAudio.src = null;
    recordedAudio.srcObject = null;
    recordedAudio.src = window.URL.createObjectURL(superBuffer);
    recordedAudio.controls = true;
    recordedAudio.play().catch(error => {
        console.error('Error playing recording:', error);
        alert('播放錄音時發生錯誤: ' + error.message);
    });
}

function downloadRecording() {
    console.log('Attempting to download recording...');
    if (recordedBlobs.length === 0) {
        console.error('No recording available to download.');
        alert('No recording available to download.');
        return;
    }

    const blob = new Blob(recordedBlobs, { type: mimeType }); // Use the global mimeType
    const reader = new FileReader();

    reader.onload = function(event) {
        console.log('FileReader loaded, result:', event.target.result);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = event.target.result;

        // Set the correct file extension based on the MIME type
        let fileExtension = '';
        if (mimeType.includes('webm')) {
            fileExtension = 'webm';
        } else if (mimeType.includes('ogg')) {
            fileExtension = 'ogg';
        } else if (mimeType.includes('mp4')) {
            fileExtension = 'mp4';
        } else if (mimeType.includes('aac')) {
            fileExtension = 'aac';
        } else {
            fileExtension = 'audio'; // Fallback if MIME type is not recognized
        }
        a.download = `recording.${fileExtension}`;

        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(event.target.result);
            console.log('Download link clicked and removed.');
        }, 100);

        console.log('Recording downloaded.');
    };

    reader.onerror = function(event) {
        console.error('FileReader error:', event);
    };

    reader.onabort = function(event) {
        console.warn('FileReader aborted:', event);
    };

    console.log('Reading blob as Data URL...');
    reader.readAsDataURL(blob);
}

// Event listeners setup on window load
window.onload = () => {
    document.getElementById('my-button').onclick = toggleListening;
    document.getElementById('record-button').onclick = toggleRecording;
    document.getElementById('play').addEventListener('click', playRecording);
    document.getElementById('download').addEventListener('click', downloadRecording);
    document.getElementById('go-home').addEventListener('click', () => {
        window.location.href = `https://nccuag.guideapp.uk`;
    });

    console.log('Event listeners set up.');
};
