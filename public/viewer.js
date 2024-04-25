// 全局變量來存储PeerConnection
let peerConnection;

document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if(name) {
        // 假設您已經有一個元素用於顯示名字
        document.getElementById('name-display').textContent = `歡迎，${name}！`;
    }
});

//當網頁加載完成後，為指定的按鈕設置一個點擊事件處理器
    document.getElementById('my-button').onclick = () => {
        init(); // 點擊按鈕時調用init函數
    }

    document.getElementById('go-home').addEventListener('click', () => {
        window.history.back();
    });

    // 為"Stop Stream"按鈕添加事件監聽器
    document.getElementById('stop-stream').addEventListener('click', () => {
        // 關閉WebRTC連接
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null; // 清空peerConnection變量
        }
        const videoElement = document.getElementById("video");
        videoElement.srcObject = null;
        videoElement.load(); // 嘗試強制video元素重新加載
    });

    document.addEventListener('DOMContentLoaded', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name');
        if(name) {
            // 假設您已經有一個元素用於顯示名字
            document.getElementById('name-display').textContent = `歡迎，${name}！`;
        }
    });


// 定義init函數，用於初始化WebRTC連接
async function init() {
    const peer = createPeer(); // 創建一個WebRTC對等連接
    
    peer.addTransceiver("video", { direction: "recvonly" }) // 添加一個接收方向的視頻傳輸器
    peer.addTransceiver("audio", { direction: "recvonly" }) // 添加一個接收方向的聲音傳輸器
}

// 定義createPeer函數，用於創建並配置一個新的RTCPeerConnection對象
function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [ // 配置ICE服務器
            {
                urls: "stun:stun.stunprotocol.org" // 使用一個公共的STUN服務器來幫助處理NAT穿透
            }
        ]
    });


    
    peer.ontrack = handleTrackEvent; // 設置當接收到媒體流時的事件處理函數
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer); // 設置當需要進行SDP協商時的事件處理函數

    return peer; // 返回創建的對等連接對象
}

// 定義handleNegotiationNeededEvent函數，處理SDP協商事件
//端點間要互相傳遞多媒體資源時必須依照SDP訂定的格式，
//並透過 Offer/Answer 的交換模式進行。

//我在這裡沒有Answer的部分
//因為這裡是viewer，只有一個offer
async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer(); // createOffer() method 來產出RTCSessionDescription : 也就是屬於 localPeer 的 session description。
    console.log('Generated Offer:', offer); //查看 Viewer 端的 Offer 是否正確生成
    await peer.setLocalDescription(offer) ////將 offer 設為本身的 local description，並將其透過 Signaling channel 傳遞給 remotePeers。
    const payload = {
        sdp: peer.localDescription // 準備將本地描述的SDP信息作為請求體發送
    };

    // 通過HTTP POST請求將提供發送到服務器的/consumer路由
    const { data } = await axios.post('/consumer', payload);
    console.log('Offer sent to server, received answer:', data);//確保 Offer 正確發送到 Server
    const desc = new RTCSessionDescription(data.sdp); // 從服務器響應中獲取並創建一個遠端描述
    peer.setRemoteDescription(desc).catch(e => console.log(e)); //remotePeer 接收到後，透過setRemoteDescription 將 localPeer 的 session description 設為自身的 remote description。
    console.log('Set remote description with answer:', desc); //確認 Viewer 正確接收並設置 Answer
}



// 定義handleTrackEvent函數，處理接收到媒體流時的事件
function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0]; 
// 將接收到的媒體流設置給網頁上的video元素，以便播放
};





