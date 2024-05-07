//!!!!!change to your own ip!!!!!!/

document.getElementById('host-button').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

document.getElementById('viewer-button').addEventListener('click', function() {
    document.getElementById('name-prompt').style.display = 'block';
});

document.getElementById('submit-password').addEventListener('click', async function() {
    const password = document.getElementById('password').value;
    if (password === "12345") {
        try {

            const response = await fetch('/api/wireless-ip');
            const data = await response.json();
            window.location.href = `http://${data.ip}:5000/host.html`;
        } catch (error) {
            console.error('Failed to get server IP', error);
            alert('Failed to connect to server.');
        }
    } else {
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
        const response = await fetch('/api/wireless-ip');
        const data = await response.json();
        window.location.href = `http://${data.ip}:5000/viewer.html?name=` + encodeURIComponent(name);
    } catch (error) {
        console.error('Failed to get wireless IP', error);
        alert('Fail to connect the server');
    }
});
