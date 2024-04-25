
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
            window.location.href = `http://localhost:5000/host.html`;
        
    } else {
        alert('密碼錯誤');
    }
});

document.getElementById('submit-name').addEventListener('click', function() {
    const name = document.getElementById('name').value;
        window.location.href = `http://localhost:5000/viewer.html?name=` + encodeURIComponent(name);
});
