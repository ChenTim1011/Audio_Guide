const ips='192.168.0.196'

document.getElementById('host-button').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

document.getElementById('viewer-button').addEventListener('click', function() {
    document.getElementById('name-prompt').style.display = 'block';
});

document.getElementById('submit-password').addEventListener('click', function() {
    const password = document.getElementById('password').value;
    if(password === "12345") { // 請將"正確的密碼"替換成你想要的密碼
        window.location.href = 'http://192.168.0.196:5000/host.html';
    } else {
        alert('密碼錯誤');
    }
});



document.getElementById('submit-name').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    window.location.href = 'http://192.168.0.196:5000/viewer.html?name=' + encodeURIComponent(name);
});