const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // New User Connects
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    // Listen for mute/unmute
    let muteButton = document.getElementById('muteButton');
    muteButton.addEventListener('click', () => {
        const enabled = myVideoStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            muteButton.innerText = 'Unmute';
        } else {
            myVideoStream.getAudioTracks()[0].enabled = true;
            muteButton.innerText = 'Mute';
        }
    });

    // Listen for video on/off
    let videoButton = document.getElementById('videoButton');
    videoButton.addEventListener('click', () => {
        const enabled = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            videoButton.innerText = 'Start Video';
        } else {
            myVideoStream.getVideoTracks()[0].enabled = true;
            videoButton.innerText = 'Stop Video';
        }
    });

    // Leave Call
    let leaveButton = document.getElementById('leaveButton');
    leaveButton.addEventListener('click', () => {
        socket.disconnect();
        window.location.href = '/';
    });
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
