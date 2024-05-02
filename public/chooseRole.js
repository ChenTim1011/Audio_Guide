//!!!!!change to your own ip!!!!!!/

document.getElementById('host-button').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

document.getElementById('viewer-button').addEventListener('click', function() {
    document.getElementById('name-prompt').style.display = 'block';
});

document.getElementById('submit-password').addEventListener('click', function() {
    const password = document.getElementById('password').value;
    if(password === "12345") { // 請將"正確的密碼"替換成你想要的密碼
        //!!!!!change to your own ip!!!!!!//
        window.location.href = 'https://audio-guide.onrender.com/host.html';
    } else {
        alert('密碼錯誤');
    }
});

document.getElementById('submit-name').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    //change to your own ip
    window.location.href = 'https://audio-guide.onrender.com/viewer.html?name=' + encodeURIComponent(name);
});
