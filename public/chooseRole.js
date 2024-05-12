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

document.getElementById('close-qr-button').addEventListener('click', function() {
    document.getElementById('qr-code-container').style.display = 'none'; // close the QR code display
});

document.getElementById('submit-password').addEventListener('click', async function() {
    const password = document.getElementById('password').value;
    if(password === "12345"){   
        window.location.href = `https://nccuag.guideapp.uk/host.html`;    
    }else{
        alert('Wrong password!');
    }
});

document.getElementById('submit-name').addEventListener('click', async function() {
    const name = document.getElementById('name').value;
    if (name.trim() === "") {
        alert('Please fill in your name！');
        return; 
    }else{
        window.location.href = `https://nccuag.guideapp.uk/viewer.html?name=${name}`;
    }
});

