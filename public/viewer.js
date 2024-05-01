// 全局變量來存储PeerConnection
let peerConnection;

// 當文檔完全加載完成後，設置相關事件處理器和初始設定
document.addEventListener('DOMContentLoaded', (event) => {
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
    const peer = createPeer(); // 創建一個WebRTC對等連接

    peer.addTransceiver("video", { direction: "recvonly" }); // 添加一個接收方向的視頻傳輸器
    peer.addTransceiver("audio", { direction: "recvonly" }); // 添加一個接收方向的聲音傳輸器
}

// 定義createPeer函數，用於創建並配置一個新的RTCPeerConnection對象
function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [ // 配置ICE服務器
            { urls: "stun:stun.stunprotocol.org" } // 使用一個公共的STUN服務器來幫助處理NAT穿透
        ]
    });
    peer.ontrack = handleTrackEvent; // 設置當接收到媒體流時的事件處理函數
    peer.onnegotiationneeded = async () => {
        try {
            const offer = await peer.createOffer(); // 創建一個SDP提供
            await peer.setLocalDescription(offer); // 將創建的提供設置為本地描述

            const payload = { sdp: peer.localDescription }; // 準備將本地描述的SDP信息作為請求體發送
            const response = await axios.post('/consumer', payload); // 通過HTTP POST請求將提供發送到服務器的/consumer路由
            const desc = new RTCSessionDescription(response.data.sdp);
            await peer.setRemoteDescription(desc); // 從服務器響應中獲取並創建一個遠端描述並設置
        } catch (error) {
            console.error('Failed to complete negotiation:', error);
        }
    };
    return peer; // 返回創建的對等連接對象
}

// 定義handleTrackEvent函數，處理接收到媒體流時的事件
function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0]; // 將接收到的媒體流設置給網頁上的video元素，以便播放
};