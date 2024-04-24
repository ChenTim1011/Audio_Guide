// 引入所需的模塊
const express = require('express'); // 引入Express框架
const app = express(); // 創建Express應用實例
const bodyParser = require('body-parser'); // 引入body-parser中間件，用於處理JSON和URL編碼的請求體
const webrtc = require("wrtc"); // 引入WebRTC庫(wrtc)

let senderStream; // 用於存儲發送者的媒體流

// 配置Express應用
app.use(express.static('public')); // 設置靜態文件目錄
app.use(bodyParser.json()); // 使用body-parser中間件解析JSON格式請求體
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL編碼的請求體


// 定義POST請求處理器，用於處理消費者的連接請求
app.post("/consumer", async ({ body }, res) => {
    // 創建一個新的WebRTC對等連接
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [ // 配置ICE服務器
            {
                urls: "stun:stun.stunprotocol.org" // 使用公共STUN服務器
            }
        ]
    });
    // 將遠端SDP設置為對等連接的遠端描述
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    // 將媒體流的軌道添加到對等連接
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    // 創建並設置對等連接的本地描述（SDP應答）
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    // 將SDP應答作為響應體發送回客戶端
    const payload = {
        sdp: peer.localDescription
    }
    res.json(payload);
});

// 定義POST請求處理器，用於處理廣播媒體流的請求
app.post('/broadcast', async ({ body }, res) => {
    // 創建一個新的WebRTC對等連接
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [ // 配置ICE服務器
            {
                urls: "stun:stun.stunprotocol.org" // 使用公共STUN服務器
            }
        ]
    });
    // 註冊`ontrack`事件處理器，當媒體流軌道被添加時調用
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    // 將遠端SDP設置為對等連接的遠端描述
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    // 創建並設置對等連接的本地描述（SDP應答）
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    // 將SDP應答作為響應體發送回客戶端
    const payload = {
        sdp: peer.localDescription
    }
    res.json(payload);
});

// `ontrack`事件的處理函數，用於處理接收到的媒體流
function handleTrackEvent(e, peer) {
    senderStream = e.streams[0]; // 存儲媒體流以供後續使用
};

// 啟動服務器，監聽5000端口
const server = app.listen(5000,'0.0.0.0' ,() => console.log('HTTP server listening on port 5000'));

server.on('error', (error) => {
  console.error('An error occurred on the server', error);
});