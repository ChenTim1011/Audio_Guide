// Global variable to store the media stream
let globalStream = null;
let peerConnection = null;
let mediaRecorder;
let recordedBlobs;
let mimeType; // Global variable to store the mimeType

// Function to initialize the media capture and WebRTC connection
async function init() {
    try {
        // Request access to the user's audio stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        globalStream = stream; // Save the stream to a global variable
        // Set the obtained stream as the source for the audio element on the web page
        document.getElementById("audio").srcObject = stream;
        // Create a WebRTC peer connection
        peerConnection = createPeer();
        // Add all tracks from the stream (audio) to the peer connection
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        handleSuccess(stream); // Call handleSuccess to enable recording functionality
    } catch (e) {
        console.error('navigator.getUserMedia error:', e);
        document.querySelector('span#errorMsg').textContent = `navigator.getUserMedia error: ${e.toString()}`;
    }
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

// Function to stop streaming and clean up resources
function stopStreaming() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        console.log('Peer connection closed.');
    }
    if (globalStream) {
        globalStream.getTracks().forEach(track => track.stop());
        document.getElementById("audio").srcObject = null;
        console.log('Audio stream stopped.');
    }
    document.getElementById('my-button').textContent = '開始直播';
}

// Function to handle button click to toggle streaming state
function toggleStreaming() {
    const button = document.getElementById('my-button');
    if (button.textContent === '開始直播') {
        button.textContent = '直播中...';
        init();
        button.textContent = '結束直播';
    } else {
        stopStreaming();
        button.textContent = '開始直播';
    }
}

// Function to handle button click to toggle recording state
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

// Function to handle recording data availability
function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
        console.log('Data available: ', event.data);
    }
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

// Function to start recording audio
async function startRecording() {
    recordedBlobs = [];
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
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

// Function to handle success in obtaining media stream
function handleSuccess(stream) {
    document.getElementById('record-button').disabled = false;
    console.log('getUserMedia() got stream:', stream);
    globalStream = stream;

    document.getElementById("audio").srcObject = stream;

    const codecPreferences = document.querySelector('#codecPreferences');
    if (codecPreferences) {
        getSupportedMimeTypes().forEach(mimeType => {
            const option = document.createElement('option');
            option.value = mimeType;
            option.innerText = mimeType;
            codecPreferences.appendChild(option);
        });
        codecPreferences.disabled = false;
    }
}

// Function to play recorded audio
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
    if (recordedBlobs.length === 0) {
        console.error('No recording available to download.');
        alert('No recording available to download.');
        return;
    }

    const blob = new Blob(recordedBlobs, { type: mimeType }); // Use the global mimeType
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    // Set the correct file extension based on the MIME type
    if (mimeType.includes('webm')) {
        a.download = 'recording.webm';
    } else if (mimeType.includes('ogg')) {
        a.download = 'recording.ogg';
    } else if (mimeType.includes('mp4')) {
        a.download = 'recording.mp4';
    } else if (mimeType.includes('aac')) {
        a.download = 'recording.aac';
    } else {
        a.download = 'recording.audio'; // Fallback if MIME type is not recognized
    }

    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);

    console.log('Recording downloaded.');
}

// Event listeners setup on window load
window.onload = () => {
    document.getElementById('my-button').onclick = toggleStreaming;
    document.getElementById('record-button').onclick = toggleRecording;
    document.getElementById('play').addEventListener('click', playRecording);
    document.getElementById('download').addEventListener('click', downloadRecording);
    document.getElementById('go-home').addEventListener('click', () => {
        window.location.href = `https://nccuag.guideapp.uk`;
    });

    console.log('Event listeners set up.');
};
