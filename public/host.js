// 定義一個全局變量來存儲媒體流
let globalStream = null;


window.onload = () => {
    // 你的事件監聽代碼
    document.getElementById('my-button').onclick = () => {
        init(); // 點擊按鈕時調用init函數
    }

    document.getElementById('go-home').addEventListener('click', () => {
        window.history.back();
    });

    document.getElementById('stop-stream').addEventListener('click', () => {
        if (globalStream) {
            globalStream.getTracks().forEach(track => track.stop());
            document.getElementById("video").srcObject = null;
        }
    });
};


// 定義init函數，異步獲取用戶的視頻流並初始化WebRTC連接
async function init() {
    // 請求獲取用戶的視頻流
    const stream = await navigator.mediaDevices.getUserMedia({ video: true , audio:true });
    globalStream = stream; // 保存到全局變量
    // 將獲取的視頻流設置到網頁上的video元素中播放
    document.getElementById("video").srcObject = stream;
    // 創建一個WebRTC對等連接
    const peer = createPeer();
    // 將視頻流的所有軌道（視頻、音頻等）添加到對等連接中
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}

// 定義createPeer函數，用於創建一個配置好的WebRTC對等連接
function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [ // 配置ICE服務器，用於處理NAT穿透
            {
                urls: "stun:stun.stunprotocol.org" // 使用一個公共的STUN服務器
            }
        ]
    });
    // 設置當需要協商時的事件處理函數
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer; // 返回創建的對等連接
}

// 定義handleNegotiationNeededEvent函數，處理協商事件
async function handleNegotiationNeededEvent(peer) {
    // 創建一個SDP提供（Offer）
    const offer = await peer.createOffer();
    // 將創建的提供設置為本地描述
    await peer.setLocalDescription(offer);
    // 準備將提供發送到服務器
    const payload = {
        sdp: peer.localDescription
    };

    // 通過HTTP POST請求將提供發送到服務器的/broadcast路由
    const { data } = await axios.post('/broadcast', payload);
    // 從服務器響應中獲取SDP應答並設置為遠端描述
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e)); // 如果設置遠端描述失敗，則捕獲錯誤並打印
}




// 新增回到上一頁的功能
document.getElementById('go-home').addEventListener('click', () => {
    window.history.back(); // 回到上一頁
});

document.getElementById('stop-stream').addEventListener('click', () => {
    if (globalStream) {
        globalStream.getTracks().forEach(track => track.stop());
        document.getElementById("video").srcObject = null; // 清除視頻元素的當前顯示
    }
});