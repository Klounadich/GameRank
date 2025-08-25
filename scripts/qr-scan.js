// Улучшенный QR Code Scanner для всех платформ
const scanQRBtn = document.getElementById('scanQRBtn');
const qrScannerModal = document.getElementById('qrScannerModal');
const closeQRScanner = document.getElementById('closeQRScanner');
const qrVideo = document.getElementById('qrVideo');
const qrCanvas = document.getElementById('qrCanvas');
const qrResultText = document.getElementById('qrResultText');
const copyQRResultBtn = document.getElementById('copyQRResultBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');

let stream = null;
let cameras = [];
let currentCameraIndex = 0;
let scanInterval = null;
let isScanning = false;

// Определение платформы
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ПРОВЕРКА ПОДДЕРЖКИ API - ИСПРАВЛЕННАЯ ВЕРСИЯ
const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const hasEnumerateDevices = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);

// Функция для проверки поддержки камеры (дополнительная проверка)
async function checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
    }
    
    try {
        // Пробуем получить доступ к камере
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            return true;
        }
        return false;
    } catch (error) {
        console.log('Камера не доступна:', error);
        return false;
    }
}

if (scanQRBtn) {
    scanQRBtn.addEventListener('click', async function() {
        // Дополнительная проверка поддержки камеры
        const cameraSupported = await checkCameraSupport();
        
        if (!cameraSupported) {
            showError('Ваш браузер не поддерживает доступ к камере');
            return;
        }
        
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            showError('Для работы сканера требуется HTTPS соединение');
            return;
        }
        
        qrScannerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        startQRScanner();
    });
}

// Остальной код остается без изменений...
if (closeQRScanner) {
    closeQRScanner.addEventListener('click', function() {
        stopQRScanner();
        closeModal();
    });
}

qrScannerModal.addEventListener('click', function(e) {
    if (e.target === qrScannerModal) {
        stopQRScanner();
        closeModal();
    }
});

function closeModal() {
    qrScannerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Основная функция запуска сканера
async function startQRScanner() {
    try {
        resetUI();
        showMessage('Запрос доступа к камере...');
        
        // Получаем список камер
        await getCameras();
        
        // Запускаем камеру
        await startCamera();
        
        showMessage('Наведите камеру на QR код');
        isScanning = true;
        
    } catch (error) {
        console.error('Ошибка запуска сканера:', error);
        handleCameraError(error);
    }
}

// Сброс UI
function resetUI() {
    qrResultText.textContent = 'Не сканировано';
    copyQRResultBtn.disabled = true;
    hideInstructions();
}

// Получение списка камер
async function getCameras() {
    try {
        if (!hasEnumerateDevices) {
            cameras = [];
            return;
        }
        
        // Сначала получаем доступ к камере
        const tempStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: 'environment' } }
        });
        tempStream.getTracks().forEach(track => track.stop());
        
        // Затем получаем список устройств
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        
        console.log('Доступные камеры:', cameras);
        
        // Пытаемся определить какая камера задняя, а какая фронтальная
        if (cameras.length > 1) {
            // Сортируем камеры: сначала задние, потом фронтальные
            cameras.sort((a, b) => {
                const aIsBack = a.label.toLowerCase().includes('back') || 
                               a.label.toLowerCase().includes('rear') ||
                               a.label.toLowerCase().includes('environment');
                const bIsBack = b.label.toLowerCase().includes('back') || 
                               b.label.toLowerCase().includes('rear') ||
                               b.label.toLowerCase().includes('environment');
                
                if (aIsBack && !bIsBack) return -1;
                if (!aIsBack && bIsBack) return 1;
                return 0;
            });
            
            // По умолчанию выбираем первую (заднюю) камеру
            currentCameraIndex = 0;
        }
        
    } catch (error) {
        console.warn('Не удалось получить список камер:', error);
        cameras = [];
    }
}

// Запуск камеры
async function startCamera() {
    try {
        const constraints = getCameraConstraints();
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        setupVideoElement();
        setupVideoStream();
        startScanning();
        
    } catch (error) {
        throw error;
    }
}

// Получение ограничений для камеры
function getCameraConstraints() {
    // Пробуем разные конфигурации для разных платформ
    const constraints = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        },
        audio: false
    };
    
    // Для мобильных устройств используем facingMode - ПРИОРИТЕТ ДЛЯ ЗАДНЕЙ КАМЕРЫ
    if (isMobile) {
        // Сначала пробуем заднюю камеру
        constraints.video.facingMode = { ideal: 'environment' };
        
        // Если на iOS/Safari, добавляем дополнительные опции
        if (isIOS || isSafari) {
            constraints.video.facingMode = { exact: 'environment' };
        }
    }
    
    // Если есть конкретная камера, используем ее
    if (cameras.length > 0 && currentCameraIndex < cameras.length) {
        constraints.video.deviceId = { exact: cameras[currentCameraIndex].deviceId };
    } else {
        // Если список камер еще не получен, явно указываем предпочтение задней камере
        constraints.video.facingMode = { ideal: 'environment' };
    }
    
    return constraints;
}

// Настройка видео элемента
function setupVideoElement() {
    qrVideo.setAttribute('autoplay', 'true');
    qrVideo.setAttribute('playsinline', 'true');
    qrVideo.setAttribute('muted', 'true');
    qrVideo.style.transform = 'scaleX(-1)'; // Зеркальное отображение для фронтальной камеры
}

// Настройка видео потока
function setupVideoStream() {
    qrVideo.srcObject = stream;
    
    return new Promise((resolve) => {
        qrVideo.onloadedmetadata = function() {
            qrVideo.play()
                .then(() => {
                    console.log('Видео запущено успешно');
                    resolve();
                })
                .catch(error => {
                    console.warn('Ошибка воспроизведения видео:', error);
                    // Продолжаем даже если play() выдал ошибку
                    resolve();
                });
        };
        
        // Таймаут на случай если onloadedmetadata не сработает
        setTimeout(resolve, 1000);
    });
}

// Запуск сканирования
function startScanning() {
    if (scanInterval) {
        clearInterval(scanInterval);
    }
    
    scanInterval = setInterval(() => {
        if (qrVideo.readyState >= qrVideo.HAVE_METADATA && qrVideo.videoWidth > 0) {
            processVideoFrame();
        }
    }, 200);
}

// Обработка видео кадра
function processVideoFrame() {
    try {
        const context = qrCanvas.getContext('2d');
        
        // Устанавливаем размер canvas
        qrCanvas.width = qrVideo.videoWidth;
        qrCanvas.height = qrVideo.videoHeight;
        
        // Рисуем кадр
        context.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
        
        // Распознаем QR код
        recognizeQRCode(context);
        
    } catch (error) {
        console.error('Ошибка обработки видео:', error);
    }
}

// Распознавание QR кода
function recognizeQRCode(context) {
    try {
        if (typeof jsQR !== 'undefined') {
            const imageData = context.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });
            
            if (code) {
                onQRCodeDetected(code.data);
            }
        } else {
            // Демо-режим если библиотека не загружена
            demoQRRecognition();
        }
    } catch (error) {
        console.error('Ошибка распознавания:', error);
    }
}

// Обработка обнаруженного QR кода
function onQRCodeDetected(data) {
    // СОХРАНЯЕМ РАСШИФРОВАННЫЙ ТЕКСТ QR-КОДА
    qrResultText.textContent = data; // ← ВОТ ТУТ БЫЛ БАГ!
    copyQRResultBtn.disabled = false;
    
    // Вибрация если поддерживается
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    // Останавливаем сканирование
    stopQRScanner();
    
    // ПОКАЗЫВАЕМ СООБЩЕНИЕ ОТДЕЛЬНО (если нужно)
    // showMessage('QR код распознан!'); ← УБИРАЕМ ЭТУ СТРОЧКУ
}

// Демо-режим распознавания
function demoQRRecognition() {
    if (Math.random() < 0.02) { // 2% шанс для демо
        const demoData = [
            "https://gamerank.ru/demo-qr",
            "Пример текстового QR кода",
            "EMAIL:test@example.com",
            "TEL:+1234567890"
        ];
        const randomData = demoData[Math.floor(Math.random() * demoData.length)];
        onQRCodeDetected(randomData);
    }
}

// Остановка сканера
function stopQRScanner() {
    isScanning = false;
    
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    if (stream) {
        try {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        } catch (error) {
            console.error('Ошибка остановки потока:', error);
        }
        stream = null;
    }
    
    if (qrVideo.srcObject) {
        qrVideo.srcObject = null;
    }
}

// Обработка ошибок
function handleCameraError(error) {
    console.error('Camera error:', error);
    
    let errorMessage = 'Не удалось получить доступ к камере';
    
    switch (error.name) {
        case 'NotAllowedError':
            errorMessage = 'Доступ к камере запрещен. Разрешите доступ в настройках браузера';
            break;
        case 'NotFoundError':
            errorMessage = 'Камера не найдена. Убедитесь, что камера подключена и работает';
            break;
        case 'NotReadableError':
            errorMessage = 'Камера уже используется другим приложением';
            break;
        case 'OverconstrainedError':
            errorMessage = 'Требуемая камера недоступна';
            break;
        case 'SecurityError':
            errorMessage = 'Доступ к камере заблокирован по соображениям безопасности';
            break;
        default:
            errorMessage = `Ошибка: ${error.message || error.name}`;
    }
    
    showError(errorMessage);
    showPlatformSpecificInstructions();
}

// Показать сообщение
function showMessage(message) {
    qrResultText.textContent = message;
    qrResultText.style.color = 'var(--light)';
}

// Показать ошибку
function showError(message) {
    qrResultText.textContent = message;
    qrResultText.style.color = 'var(--accent)';
}

// Показать инструкции для конкретной платформы
function showPlatformSpecificInstructions() {
    let instructions = '';
    
    if (isIOS) {
        instructions = getIOSInstructions();
    } else if (isSafari) {
        instructions = getSafariInstructions();
    } else {
        instructions = getGeneralInstructions();
    }
    
    showInstructions(instructions);
}

function getIOSInstructions() {
    return `
        <div class="platform-instructions">
            <h4>📱 Инструкция для iPhone:</h4>
            <p>1. Нажмите "Разрешить" при запросе доступа к камере</p>
            <p>2. Если не видите запрос:</p>
            <p>   • Откройте <strong>Настройки → Safari → Камера</strong></p>
            <p>   • Разрешите доступ для этого сайта</p>
            <p>3. Убедитесь, что используете HTTPS</p>
        </div>
    `;
}

function getSafariInstructions() {
    return `
        <div class="platform-instructions">
            <h4>🖥️ Инструкция для Safari:</h4>
            <p>1. Нажмите "Разрешить" при запросе доступа к камере</p>
            <p>2. Проверьте настройки:</p>
            <p>   • Safari → Настройки → Веб-сайты → Камера</p>
            <p>   • Разрешите доступ для этого сайта</p>
            <p>3. Обновите страницу</p>
        </div>
    `;
}

function getGeneralInstructions() {
    return `
        <div class="platform-instructions">
            <h4>🔧 Общие инструкции:</h4>
            <p>1. Разрешите доступ к камере в браузере</p>
            <p>2. Убедитесь, что камера подключена и работает</p>
            <p>3. Проверьте, что другие приложения не используют камера</p>
            <p>4. Обновите драйверы камеры</p>
            <p>5. Попробуйте другой браузер (Chrome, Firefox)</p>
        </div>
    `;
}

function showInstructions(html) {
    const container = document.querySelector('.qr-scanner-body');
    let instructionsDiv = container.querySelector('.platform-instructions');
    
    if (!instructionsDiv) {
        instructionsDiv = document.createElement('div');
        instructionsDiv.className = 'platform-instructions';
        container.appendChild(instructionsDiv);
    }
    
    instructionsDiv.innerHTML = html;
}

function hideInstructions() {
    const instructions = document.querySelector('.platform-instructions');
    if (instructions) {
        instructions.remove();
    }
}

// Смена камеры
if (switchCameraBtn) {
    switchCameraBtn.style.display = cameras.length > 1 ? 'flex' : 'none';
    
    switchCameraBtn.addEventListener('click', async function() {
        if (cameras.length <= 1) {
            alert('Доступна только одна камера');
            return;
        }
        
        stopQRScanner();
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        
        try {
            await startQRScanner();
        } catch (error) {
            console.error('Ошибка переключения камеры:', error);
            showError('Ошибка переключения камеры');
        }
    });
}

// Копирование результата
if (copyQRResultBtn) {
    copyQRResultBtn.addEventListener('click', function() {
        const text = qrResultText.textContent;
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showTempMessage('Текст скопирован!');
            })
            .catch(err => {
                // Fallback метод
                copyToClipboardFallback(text);
            });
    });
}

function showTempMessage(message) {
    const originalText = qrResultText.textContent;
    qrResultText.textContent = message;
    qrResultText.style.color = 'var(--secondary)';
    
    setTimeout(() => {
        qrResultText.textContent = originalText;
        qrResultText.style.color = 'var(--light)';
    }, 2000);
}

function copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showTempMessage('Текст скопирован!');
    } catch (err) {
        showError('Не удалось скопировать текст');
    }
    
    document.body.removeChild(textArea);
}

// Проверка при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    const cameraSupported = await checkCameraSupport();
    if (!cameraSupported) {
        scanQRBtn.style.opacity = '0.5';
        scanQRBtn.title = 'Ваш браузер не поддерживает доступ к камере';
    }
});