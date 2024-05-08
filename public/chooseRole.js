document.getElementById('host-button').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

document.getElementById('viewer-button').addEventListener('click', function() {
    document.getElementById('name-prompt').style.display = 'block';
});

document.getElementById('show-qr-button').addEventListener('click', async function() {
    try {
        const response = await fetch('/generate-qrcode');
        if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('qr-code-image').src = imageUrl;
            document.getElementById('qr-code-container').style.display = 'block';
        } else {
            console.error('Failed to fetch QR Code: ', response.statusText);
            alert('Failed to load QR Code.');
        }
    } catch (error) {
        console.error('Error fetching QR Code', error);
        alert('Error fetching QR Code.');
    }
});

document.getElementById('close-qr-button').addEventListener('click', function() {
    document.getElementById('qr-code-container').style.display = 'none'; // close the QR code display
});

document.getElementById('submit-password').addEventListener('click', async function() {
    const password = document.getElementById('password').value;
    if(password === "12345"){
        try {
            //const response = await fetch('/api/wireless-ip');
            //const data = await response.json();
            //window.location.href = `http://${data.ip}:5000/host.html`;
            const response = await fetch('/api/ngrok-url');  // 更新為新的API端點
            if (response.ok) {  // 確保響應是 200 OK
                const data = await response.json();  // 嘗試解析 JSON
                window.location.href = `${data.url}/host.html`;
            } else {
                console.error('Failed to get ngrok URL: ', response.statusText);
                alert('Failed to connect to server: ' + response.statusText);
            }
        }catch (error){
            //console.error('Failed to get server IP', error);
            console.error('Failed to get ngrok URL', error);
            alert('Failed to connect to server.');
        }
    }else{
        alert('Wrong password!');
    }
});

document.getElementById('submit-name').addEventListener('click', async function() {
    const name = document.getElementById('name').value;
    if (name.trim() === "") {
        alert('Please fill in your name！');
        return; 
    }
    try {
        //const response = await fetch('/api/wireless-ip');
        //const data = await response.json();
        //window.location.href = `http://${data.ip}:5000/viewer.html?name=` + encodeURIComponent(name);
        const response = await fetch('/api/ngrok-url');  // 更新為新的API端點
        if (response.ok) {  // 確保響應是 200 OK
            const data = await response.json();  // 嘗試解析 JSON
            window.location.href = `${data.url}/viewer.html?name=` + encodeURIComponent(name);  // 使用ngrok URL更新
        } else {
            console.error('Failed to get ngrok URL: ', response.statusText);
            alert('Failed to connect to server: ' + response.statusText);
        }   
    } catch (error) {
        console.error('Failed to get ngrok URL', error);
        //console.error('Failed to get wireless IP', error);
        alert('Fail to connect the server');
    }
});


async function fetchAndDisplayQRCode() {
    try {
        const response = await fetch('/generate-qrcode');
        if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('qr-code-image').src = imageUrl;
            document.getElementById('qr-code-container').style.display = 'block';
        } else {
            console.error('Failed to fetch QR Code: ', response.statusText);
            alert('Failed to load QR Code.');
        }
    } catch (error) {
        console.error('Error fetching QR Code', error);
        alert('Error fetching QR Code.');
    }
}