const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream);

function ambilFoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const judulInput = document.getElementById("judul").value;
    document.getElementById("judulKoran").innerText =
        judulInput ? `KORAN ${judulInput.toUpperCase()}` : "KORAN YOGYAKARTA";
}

function download() {
    const link = document.createElement("a");
    link.download = "photobooth-koran.png";
    link.href = canvas.toDataURL();
    link.click();
}
