const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const koranSection = document.getElementById("koranSection");
const btnDownload = document.getElementById("btnDownload");
const flash = document.getElementById("flash");

// Initialize Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user"
            }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Gagal mengakses kamera. Pastikan izin kamera diberikan!");
    }
}

// Set dynamic date
function setDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('tanggal').innerText = today.toLocaleDateString('id-ID', options).toUpperCase();
}

// Update Content (Headline & Image)
function updateContent() {
    const customInput = document.getElementById("judulCustom");
    const currentTitle = customInput.value || "YOGYAKARTA";

    // Newspaper 1
    const head1 = document.getElementById("mainHeadline");
    if (head1) head1.innerText = currentTitle.toUpperCase();

    // Newspaper 2 (Double)
    const headDouble = document.querySelector(".headlineDouble");
    if (headDouble) headDouble.innerText = currentTitle.toUpperCase();

    // Strip
    const stripCaption = document.getElementById("stripCaption");
    if (stripCaption) stripCaption.innerText = currentTitle;

    // Grid
    const gridCaption = document.getElementById("gridCaption");
    if (gridCaption) gridCaption.innerText = currentTitle;

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    const tgl = document.getElementById("tanggal");
    if (tgl) tgl.innerText = dateStr;
    const tglDouble = document.querySelector(".tanggalDouble");
    if (tglDouble) tglDouble.innerText = dateStr;
    const stripDate = document.getElementById("stripDate");
    if (stripDate) stripDate.innerText = now.toLocaleDateString('id-ID');
}

// Fetch City Image
let searchTimeout;
function fetchCityImage(query) {
    if (!query) return;
    if (query === "your text" || query === "") query = "City Street";

    const cityImg = document.getElementById("cityImage");
    const prompt = `old vintage newspaper photo of ${query} city landmark, black and white sketch, high contrast, historical`;

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=120&nologo=true`;
        cityImg.src = url;
    }, 800);
}

function triggerFlash() {
    flash.classList.add("flash-active");
    setTimeout(() => {
        flash.classList.remove("flash-active");
    }, 200);
}

// Router for Capture Button
let selectedFilter = 'normal';

// Add listeners for filter circles
function initFilters() {
    document.querySelectorAll('.filter-circle').forEach(circle => {
        circle.addEventListener('click', () => {
            document.querySelectorAll('.filter-circle').forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            selectedFilter = circle.dataset.filter;
            applyFilterToVideo();
        });
    });
}

function applyFilterToVideo() {
    switch (selectedFilter) {
        case 'bw': video.style.filter = 'grayscale(1)'; break;
        case 'sepia': video.style.filter = 'sepia(1)'; break;
        case 'warm': video.style.filter = 'sepia(0.3) saturate(1.5)'; break;
        case 'cool': video.style.filter = 'hue-rotate(180deg) saturate(1.2)'; break;
        case 'vintage': video.style.filter = 'contrast(1.2) brightness(0.9) sepia(0.5)'; break;
        case 'dramatic': video.style.filter = 'contrast(1.5) brightness(0.8)'; break;
        default: video.style.filter = 'none';
    }
}

function startCountdown(duration, callback) {
    const overlay = document.getElementById("countdown");
    overlay.style.display = "flex";
    let timeLeft = duration;
    overlay.innerText = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            overlay.style.display = "none";
            callback();
        } else {
            overlay.innerText = timeLeft;
        }
    }, 1000);
}

function takePhoto() {
    const btn = document.getElementById("btnCapture");
    if (btn.disabled) return;
    btn.disabled = true;

    startCountdown(3, () => {
        const layoutMode = document.querySelector('input[name="layoutMode"]:checked').value;

        if (layoutMode === 'polaroid') {
            captureNextStripPhoto();
        } else if (layoutMode === 'grid') {
            captureNextGridPhoto();
        } else if (layoutMode === 'double-news') {
            captureNextDoubleNewsPhoto();
        } else {
            ambilFoto();
        }
        btn.disabled = false;
    });
}

let currentStripIndex = 0;

function captureNextStripPhoto() {
    if (currentStripIndex >= 3) {
        if (confirm("Start new photostrip?")) resetCamera();
        return;
    }
    runCaptureSequence(3, "stripCanvas", "polaroid");
}

function captureNextGridPhoto() {
    if (currentStripIndex >= 4) {
        if (confirm("Start new grid?")) resetCamera();
        return;
    }
    runCaptureSequence(4, "gridCanvas", "grid");
}

function captureNextDoubleNewsPhoto() {
    if (currentStripIndex >= 2) {
        if (confirm("Start new double news?")) resetCamera();
        return;
    }
    runCaptureSequence(2, "doubleCanvas", "double-news");
}

function runCaptureSequence(maxCount, canvasPrefix, mode) {
    triggerFlash();

    const c = document.getElementById(canvasPrefix + (currentStripIndex + 1));
    const ctxStrip = c.getContext("2d");

    c.width = 1200;
    c.height = 900;

    ctxStrip.filter = getCanvasFilter();

    ctxStrip.translate(c.width, 0);
    ctxStrip.scale(-1, 1);
    ctxStrip.drawImage(video, 0, 0, c.width, c.height);
    ctxStrip.setTransform(1, 0, 0, 1, 0, 0);

    currentStripIndex++;
    document.getElementById("progressIndicator").innerText = `${currentStripIndex}/${maxCount}`;
    document.getElementById("btnDownload").style.display = "block";

    const btn = document.getElementById("btnCapture");
    if (currentStripIndex < maxCount) {
        btn.innerHTML = `CAPTURE ${currentStripIndex + 1}/${maxCount} 📸`;
    } else {
        btn.innerText = "DONE! 🎉";
        if (window.innerWidth < 768) {
            document.getElementById("resultArea").scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function getCanvasFilter() {
    switch (selectedFilter) {
        case 'bw': return 'grayscale(100%) contrast(120%)';
        case 'sepia': return 'sepia(100%)';
        case 'warm': return 'sepia(30%) saturate(150%) contrast(110%)';
        case 'cool': return 'hue-rotate(180deg) saturate(120%) brightness(1.1)';
        case 'vintage': return 'contrast(120%) brightness(90%) sepia(50%)';
        case 'dramatic': return 'contrast(150%) brightness(80%) grayscale(20%)';
        case 'soft': return 'blur(2px) brightness(1.1) saturate(80%)';
        default: return 'none';
    }
}

function ambilFoto() {
    triggerFlash();
    canvas.width = 1200;
    canvas.height = 900;

    const ctxLocal = canvas.getContext("2d");
    ctxLocal.fillStyle = "#fdfbf7";
    ctxLocal.fillRect(0, 0, canvas.width, canvas.height);
    ctxLocal.filter = getCanvasFilter();

    ctxLocal.translate(canvas.width, 0);
    ctxLocal.scale(-1, 1);
    ctxLocal.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctxLocal.setTransform(1, 0, 0, 1, 0, 0);

    document.getElementById("btnDownload").style.display = "block";
    document.getElementById("progressIndicator").innerText = `1/1`;
    document.getElementById("btnCapture").innerText = "DONE! 🎉";

    if (window.innerWidth < 768) {
        document.getElementById("resultArea").scrollIntoView({ behavior: 'smooth' });
    }
}

function updateLayoutMode() {
    const mode = document.querySelector('input[name="layoutMode"]:checked').value;

    document.getElementById("koran").style.display = "none";
    document.getElementById("photoStrip").style.display = "none";
    const gridDiv = document.getElementById("photoGrid");
    if (gridDiv) gridDiv.style.display = "none";
    const dNews = document.getElementById("koranDouble");
    if (dNews) dNews.style.display = "none";

    const btn = document.getElementById("btnCapture");
    const progress = document.getElementById("progressIndicator");

    if (mode === 'classic') {
        document.getElementById("koran").style.display = "block";
        btn.innerText = "START 📸";
        progress.innerText = "0/1";
    } else if (mode === 'polaroid') {
        document.getElementById("photoStrip").style.display = "flex";
        btn.innerText = "START 📸";
        progress.innerText = "0/3";
        currentStripIndex = 0;
    } else if (mode === 'grid') {
        if (gridDiv) gridDiv.style.display = "flex";
        btn.innerText = "START 📸";
        progress.innerText = "0/4";
        currentStripIndex = 0;
    } else if (mode === 'double-news') {
        if (dNews) dNews.style.display = "block";
        btn.innerText = "START 📸";
        progress.innerText = "0/2";
        currentStripIndex = 0;
    }

    updateContent();
}

function resetCamera() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 1; i <= 3; i++) {
        const c = document.getElementById(`stripCanvas${i}`);
        if (c) {
            c.width = c.width; // Clear content
            c.getContext("2d").clearRect(0, 0, c.width, c.height);
        }
    }
    for (let i = 1; i <= 4; i++) {
        const c = document.getElementById(`gridCanvas${i}`);
        if (c) {
            c.width = c.width; // Clear content
            c.getContext("2d").clearRect(0, 0, c.width, c.height);
        }
    }
    for (let i = 1; i <= 2; i++) {
        const c = document.getElementById(`doubleCanvas${i}`);
        if (c) {
            c.width = c.width; // Clear content
            c.getContext("2d").clearRect(0, 0, c.width, c.height);
        }
    }
    document.getElementById("btnDownload").style.display = "none";
    currentStripIndex = 0;
    updateLayoutMode();
}

function retakeLastPhoto() {
    if (currentStripIndex <= 0) {
        alert("Belum ada foto yang diambil!");
        return;
    }

    const mode = document.querySelector('input[name="layoutMode"]:checked').value;
    let canvasPrefix = "";
    let maxCount = 1;

    if (mode === 'polaroid') { canvasPrefix = "stripCanvas"; maxCount = 3; }
    else if (mode === 'grid') { canvasPrefix = "gridCanvas"; maxCount = 4; }
    else if (mode === 'double-news') { canvasPrefix = "doubleCanvas"; maxCount = 2; }
    else { canvasPrefix = "canvas"; maxCount = 1; }

    // Clear the canvas of the last photo
    const c = document.getElementById(canvasPrefix + (canvasPrefix === "canvas" ? "" : currentStripIndex));
    if (c) {
        const ctxL = c.getContext("2d");
        ctxL.clearRect(0, 0, c.width, c.height);
        c.width = c.width; // Force clear
    }

    // Decrement index
    currentStripIndex--;

    // Update UI
    document.getElementById("progressIndicator").innerText = `${currentStripIndex}/${maxCount}`;
    const btn = document.getElementById("btnCapture");
    btn.disabled = false;
    btn.innerHTML = currentStripIndex === 0 ? "START 📸" : `CAPTURE ${currentStripIndex + 1}/${maxCount} 📸`;

    if (currentStripIndex === 0) {
        document.getElementById("btnDownload").style.display = "none";
    }

    alert("Silakan ambil ulang gaya Anda!");
}

function download() {
    mergeAndDownload();
}

function mergeAndDownload() {
    const layoutModeElement = document.querySelector('input[name="layoutMode"]:checked');
    const layoutMode = layoutModeElement ? layoutModeElement.value : 'polaroid';
    const master = document.createElement("canvas");
    const mctx = master.getContext("2d");

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    const titleText = (document.getElementById("judulCustom").value || "YOGYAKARTA").toUpperCase();

    const wrap = (ctx, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    };

    if (layoutMode === 'classic' || layoutMode === 'double-news') {
        master.width = 1200;
        master.height = 1750;
        mctx.fillStyle = "#fdfbf7";
        mctx.fillRect(0, 0, master.width, master.height);
        mctx.fillStyle = "#000";

        if (layoutMode === 'classic') {
            mctx.textAlign = "center";
            mctx.font = "bold 55px serif";
            mctx.fillText("The Daily Snap", 600, 100);
            mctx.fillRect(50, 125, 1100, 3);
            mctx.font = "bold 26px sans-serif";
            mctx.fillText(`VOL. 01 — ${dateStr} — RP 2.000`, 600, 165);
            mctx.fillRect(50, 185, 1100, 2);
            mctx.font = "900 100px serif";
            mctx.fillText(titleText, 600, 305);

            const imgX = document.getElementById("canvas");
            if (imgX) mctx.drawImage(imgX, 80, 365, 1040, 780);

            mctx.textAlign = "left";
            mctx.font = "bold 34px serif";
            mctx.fillText("Trending Now", 80, 1225);
            mctx.fillText("Weather Update", 620, 1225);

            mctx.font = "24px serif";
            const c1 = "Suasana kota semakin hari semakin memikat wisatawan. Banyak pelancong berdatangan untuk menikmati keindahan malam yang syahdu dan penuh kenangan.";
            const c2 = "Cuaca cerah menyelimuti langit hari ini. Sangat cocok untuk berjalan-jalan mengelilingi sudut kota dan mengabadikan setiap momen bersama orang tercinta.";
            wrap(mctx, c1, 80, 1275, 500, 35);
            wrap(mctx, c2, 620, 1275, 500, 35);

            mctx.textAlign = "center";
            mctx.font = "italic 20px sans-serif";
            mctx.fillText("Highlights: Abadikan momenmu hari ini.", 600, 1170);
        } else {
            mctx.textAlign = "center";
            mctx.font = "900 120px serif";
            mctx.fillText("MALIOBORO", 600, 130);
            mctx.fillRect(50, 165, 1100, 4);
            mctx.font = "bold 28px sans-serif";
            mctx.fillText(`VOL. 02 — ${dateStr} — RP 2.000`, 600, 215);
            mctx.fillRect(50, 235, 1100, 2);
            mctx.font = "900 110px serif";
            mctx.fillText(titleText, 600, 365);

            const p1 = document.getElementById("doubleCanvas1");
            if (p1) mctx.drawImage(p1, 60, 425, 1080, 700);

            mctx.textAlign = "left";
            mctx.font = "26px serif";
            const story = "LIFESTYLE — Momen berharga tidak akan terulang dua kali. Pastikan setiap detik dalam hidupmu terekam dengan indah dalam bingkai klasik yang tak lekang oleh waktu. Suasana kota Jogja semakin hari semakin memikat hati para pelancong yang singgah. Kota budaya ini menyimpan sejuta kenangan.";
            wrap(mctx, story, 60, 1210, 600, 38);

            const p2 = document.getElementById("doubleCanvas2");
            if (p2) mctx.drawImage(p2, 700, 1180, 440, 330);
            mctx.textAlign = "center";
            mctx.font = "italic 22px sans-serif";
            mctx.fillText("Highlights: Daily Snap", 920, 1550);
        }
    } else if (layoutMode === 'polaroid') {
        master.width = 600;
        master.height = 1600;
        mctx.fillStyle = "#ffffff";
        mctx.fillRect(0, 0, 600, 1600);
        for (let i = 1; i <= 3; i++) {
            const sc = document.getElementById(`stripCanvas${i}`);
            if (sc) mctx.drawImage(sc, 50, 50 + (i - 1) * 450, 500, 400);
        }
        mctx.fillStyle = "#000";
        mctx.textAlign = "center";
        mctx.font = "60px cursive";
        mctx.fillText(titleText, 300, 1480);
        mctx.font = "30px sans-serif";
        mctx.fillText(now.toLocaleDateString('id-ID'), 300, 1540);
    } else if (layoutMode === 'grid') {
        master.width = 1000;
        master.height = 1400;
        mctx.fillStyle = "#ffffff";
        mctx.fillRect(0, 0, 1000, 1400);
        for (let i = 0; i < 4; i++) {
            const gc = document.getElementById(`gridCanvas${i + 1}`);
            if (gc) {
                const x = (i % 2 === 0) ? 50 : 520;
                const y = (i < 2) ? 50 : 450;
                mctx.drawImage(gc, x, y, 430, 350);
            }
        }
        mctx.fillStyle = "#000";
        mctx.textAlign = "center";
        mctx.font = "80px cursive";
        mctx.fillText(titleText, 500, 1250);
    }

    const link = document.createElement("a");
    link.download = `photobooth-${layoutMode}-${Date.now()}.jpg`;
    link.href = master.toDataURL("image/jpeg", 0.95);
    link.click();
}

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const links = document.getElementById('nav-links');
    if (window.innerWidth <= 768) {
        menu.classList.toggle('active');
        links.classList.toggle('active');
    }
}

function hideAll() {
    const screens = ["landingPage", "appInterface", "aboutPage", "policyPage", "spotlightPage", "contactPage", "layoutPage"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}

function enterLayoutSelection() {
    hideAll();
    document.getElementById("layoutPage").style.display = "flex";
}

function selectLayout(mode) {
    if (mode === 'city') {
        alert("City layout is coming soon! Switching to Newspaper for now.");
        mode = 'classic';
    }
    const radio = document.querySelector(`input[name="layoutMode"][value="${mode}"]`);
    if (radio) radio.checked = true;
    enterApp();
}

function enterApp() {
    hideAll();
    document.getElementById("appInterface").style.display = "block";
    updateLayoutMode();
}

function goHome() {
    hideAll();
    document.getElementById("landingPage").style.display = "flex";
}

function enterAbout() {
    hideAll();
    document.getElementById("aboutPage").style.display = "flex";
}

function enterPolicy() {
    hideAll();
    document.getElementById("policyPage").style.display = "flex";
}

function enterSpotlight() {
    hideAll();
    document.getElementById("spotlightPage").style.display = "flex";
}

function enterContact() {
    hideAll();
    document.getElementById("contactPage").style.display = "flex";
}

// --- UPLOAD ---
let cropper;
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const modal = document.getElementById("cropModal");
        const image = document.getElementById("imageToCrop");
        image.src = e.target.result;
        modal.style.display = "flex";
        if (cropper) cropper.destroy();
        const layoutMode = document.querySelector('input[name="layoutMode"]:checked').value;
        let cropRatio = 4 / 3;
        if (layoutMode === 'double-news' && currentStripIndex === 0) cropRatio = 16 / 9;
        cropper = new Cropper(image, { aspectRatio: cropRatio, viewMode: 1, autoCropArea: 1 });
    };
    reader.readAsDataURL(file);
}

function applyCrop() {
    if (!cropper) return;
    const croppedCanvas = cropper.getCroppedCanvas({ width: 1200, height: 900 });
    const img = new Image();
    img.onload = function () {
        processImageCapture(img);
        cancelCrop();
    };
    img.src = croppedCanvas.toDataURL();
}

function cancelCrop() {
    document.getElementById("cropModal").style.display = "none";
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

function processImageCapture(source) {
    const mode = document.querySelector('input[name="layoutMode"]:checked').value;
    if (mode === 'polaroid') drawToCanvas(source, "stripCanvas", 3);
    else if (mode === 'grid') drawToCanvas(source, "gridCanvas", 4);
    else if (mode === 'double-news') drawToCanvas(source, "doubleCanvas", 2);
    else drawToNewspaper(source);
}

function drawToCanvas(source, canvasPrefix, maxCount) {
    const c = document.getElementById(canvasPrefix + (currentStripIndex + 1));
    const ctxL = c.getContext("2d");
    c.width = 1200;
    c.height = 900;
    ctxL.fillStyle = "#ffffff";
    ctxL.fillRect(0, 0, c.width, c.height);
    ctxL.filter = getCanvasFilter();

    const imgRatio = source.width / source.height;
    const canvasRatio = c.width / c.height;
    let drawW, drawH, drawX, drawY;
    if (imgRatio > canvasRatio) {
        drawH = source.height;
        drawW = source.height * canvasRatio;
        drawX = (source.width - drawW) / 2;
        drawY = 0;
    } else {
        drawW = source.width;
        drawH = source.width / canvasRatio;
        drawX = 0;
        drawY = (source.height - drawH) / 2;
    }
    ctxL.drawImage(source, drawX, drawY, drawW, drawH, 0, 0, c.width, c.height);
    currentStripIndex++;
    document.getElementById("progressIndicator").innerText = `${currentStripIndex}/${maxCount}`;
    document.getElementById("btnDownload").style.display = "block";
    const btn = document.getElementById("btnCapture");
    if (currentStripIndex < maxCount) btn.innerHTML = `CAPTURE ${currentStripIndex + 1}/${maxCount} 📸`;
    else btn.innerText = "DONE! 🎉";
}

function drawToNewspaper(source) {
    const cLocal = document.getElementById("canvas");
    const ctxL = cLocal.getContext("2d");
    cLocal.width = 1200;
    cLocal.height = 900;
    ctxL.fillStyle = "#fdfbf7";
    ctxL.fillRect(0, 0, cLocal.width, cLocal.height);
    ctxL.filter = getCanvasFilter();

    const imgRatio = source.width / source.height;
    const canvasRatio = cLocal.width / cLocal.height;
    let drawW, drawH, drawX, drawY;
    if (imgRatio > canvasRatio) {
        drawH = source.height; drawW = source.height * canvasRatio;
        drawX = (source.width - drawW) / 2; drawY = 0;
    } else {
        drawW = source.width; drawH = source.width / canvasRatio;
        drawX = 0; drawY = (source.height - drawH) / 2;
    }
    ctxL.drawImage(source, drawX, drawY, drawW, drawH, 0, 0, cLocal.width, cLocal.height);
    document.getElementById("btnDownload").style.display = "block";
    document.getElementById("progressIndicator").innerText = `1/1`;
    document.getElementById("btnCapture").innerText = "DONE! 🎉";
}

startCamera();
setDate();
updateContent();
initFilters();
