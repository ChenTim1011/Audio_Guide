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

const os = require('os');

// Function to get the IPv4 address of the specified wireless interface
function getWirelessIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        if (interfaceName.startsWith("wlan") || interfaceName.includes("Wi-Fi") || interfaceName.includes("Wireless")) { // 根据接口名称来筛选
            for (const iface of interfaces[interfaceName]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address; // 返回找到的第一个IPv4地址
                }
            }
        }
    }
    return 'localhost'; // 如果没有找到wireless或没有IPv4地址，返回localhost
}

// API to get the wireless IP address of the server
app.get('/api/wireless-ip', (req, res) => {
    res.json({ ip: getWirelessIP() });
});

const axios = require('axios');
const ngrok = require('ngrok');

// 假設您已配置好ngrok並且本地API可用於獲取地址
app.get('/api/ngrok-url', async (req, res) => {
    try {
        const ngrokResponse = await axios.get('http://localhost:4040/api/tunnels');
        if (ngrokResponse.data && ngrokResponse.data.tunnels.length > 0) {
            const ngrokUrl = ngrokResponse.data.tunnels[0].public_url;
            res.json({ url: ngrokUrl });
        } else {
            res.status(404).json({ error: 'No active tunnels found' });
        }
    } catch (error) {
        console.error('Error fetching ngrok URL:', error);
        res.status(500).json({ error: 'Error fetching ngrok URL' });
    }
});


// 定義根路由的GET請求處理器，用於提供index.html文件
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

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
    console.log('Received offer from viewer:', desc); //檢查 Server 端是否正確接收並處理 Offer
    // 將媒體流的軌道添加到對等連接
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    // 創建並設置對等連接的本地描述（SDP應答）
    const answer = await peer.createAnswer();
    console.log('Generated answer for viewer:', answer);
    await peer.setLocalDescription(answer);
    // 將SDP應答作為響應體發送回客戶端
    const payload = {
        sdp: peer.localDescription
    }
    res.json(payload);
    console.log('Answer sent back to viewer'); //確認 Server 正確返回 Answer
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
//You have to check port 5000 is available or not
//sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT to allow
// port = 5000
// const server = app.listen(port,'0.0.0.0' ,() => console.log('HTTP server listening on port 5000'));

// server.on('error', (error) => {
//   console.error('An error occurred on the server', error);
// });


const port = 5000;
  app.listen(port, '0.0.0.0', async () => {
      console.log(`Server running on http://localhost:${port}`);
      try {
          const url = await ngrok.connect({ 
            api: 'http://127.0.0.1:5000', //程式碼中使用正確的 ngrok API URL
            addr: port }); // 確保這裡使用正確的連接方式
          console.log(`ngrok tunnelled at ${url}`);
      } catch (error) {
          console.error('Failed to start ngrok', error);
      }
  });
