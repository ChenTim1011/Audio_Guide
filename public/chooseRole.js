
document.getElementById('host-button').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

document.getElementById('viewer-button').addEventListener('click', function() {
    document.getElementById('name-prompt').style.display = 'block';
});

// USE fetch() TO GET THE SERVER'S IP ADDRESS
document.getElementById('submit-password').addEventListener('click', function() {
    const password = document.getElementById('password').value;
    if (password === "12345") {
        fetch('/get-ip').then(response => response.json()).then(data => {
            const serverIP = data.ip;
            window.location.href = `http://raspberrypi.local:5000/host.html`;
        });
    } else {
        alert('密碼錯誤');
    }
});

document.getElementById('submit-name').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    fetch('/get-ip').then(response => response.json()).then(data => {
        const serverIP = data.ip;
        window.location.href = `http://raspberrypi.local:5000/viewer.html?name=` + encodeURIComponent(name);
    });
});
