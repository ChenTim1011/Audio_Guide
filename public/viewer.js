// 全局變量來存储PeerConnection
let peerConnection;

// 當文檔完全加載完成後，設置相關事件處理器和初始設定
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('Document loaded and DOM fully initialized.');
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
        // 假設您已經有一個元素用於顯示名字
        document.getElementById('name-display').textContent = `歡迎，${name}！`;
    }

    // 設置按鈕事件處理器
    document.getElementById('my-button').onclick = () => {
        init(); // 點擊按鈕時調用init函數
    };

    document.getElementById('go-home').addEventListener('click', () => {
        window.history.back(); // 返回上一頁
    });

    document.getElementById('stop-stream').addEventListener('click', () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null; // 清空peerConnection變量
        }
        const videoElement = document.getElementById("video");
        videoElement.srcObject = null;
        videoElement.load(); // 嘗試強制video元素重新加載
    });
});


// 定義init函數，用於初始化WebRTC連接
async function init() {
    console.log('Initializing peer connection...');
    const peer = createPeer(); // 創建一個WebRTC對等連接

    console.log('Adding transceivers for video and audio...');
    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver("audio", { direction: "recvonly" });
}

// 定義createPeer函數，用於創建並配置一個新的RTCPeerConnection對象
function createPeer() {
    console.log('Creating new RTCPeerConnection...');
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
    });

    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = async () => {
        console.log('Negotiation needed...');
        try {
            const offer = await peer.createOffer();
            console.log('Offer created:', offer);
            await peer.setLocalDescription(offer);
            console.log('Local description set successfully.');

            const payload = { sdp: peer.localDescription };
            console.log('Sending offer to server...');
            const response = await axios.post('/consumer', payload);
            console.log('Offer sent, server response:', response);

            const desc = new RTCSessionDescription(response.data.sdp);
            await peer.setRemoteDescription(desc);
            console.log('Remote description set successfully.');
        } catch (error) {
            console.error('Failed to complete negotiation:', error);
        }
    };
    return peer;
}

// 定義handleTrackEvent函數，處理接收到媒體流時的事件
function handleTrackEvent(e) {
    console.log('Track event received:', e);
    const audioElement = document.getElementById("audio");
    console.log('Audio element:', audioElement);  // 確認元素是否獲取成功
    if (audioElement) {
        e.streams[0].getTracks().forEach(track => {
            if (track.kind === 'video') {
                document.getElementById("video").srcObject = new MediaStream([track]);
            } else if (track.kind === 'audio') {
                audioElement.srcObject = new MediaStream([track]);
            }
        });
        console.log('Tracks added to their respective elements.');
    } else {
        console.error('Audio element not found in the document.');
    }
}
