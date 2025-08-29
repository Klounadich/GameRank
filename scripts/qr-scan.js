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
let scanInterval = null;
let isScanning = false;

// Определение платформы
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Проверка поддержки API
const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// Функция для проверки поддержки камеры
async function checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
    }
    
    try {
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

// Обработчик кнопки сканирования
if (scanQRBtn) {
    scanQRBtn.addEventListener('click', async function() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            showError('Для работы сканера требуется HTTPS соединение');
            return;
        }
        
        const cameraSupported = await checkCameraSupport();
        
        if (!cameraSupported) {
            showError('Ваш браузер не поддерживает доступ к камере');
            return;
        }
        
        qrScannerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        startQRScanner();
    });
}

// Закрытие сканера
if (closeQRScanner) {
    closeQRScanner.addEventListener('click', function() {
        stopQRScanner();
        closeModal();
    });
}

// Закрытие по клику вне области
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
        
        await startCameraSimple();
        
        showMessage('Наведите камеру на QR код');
        isScanning = true;
        
    } catch (error) {
        console.error('Ошибка запуска сканера:', error);
        handleCameraError(error);
    }
}

// Упрощенный запуск камеры
async function startCameraSimple() {
    try {
        // Базовые настройки
        const constraints = {
            video: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
            },
            audio: false
        };
        
        // Для мобильных устройств пробуем заднюю камеру
        if (isMobile) {
            constraints.video.facingMode = { ideal: 'environment' };
        }
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        setupVideoElement();
        setupVideoStream();
        startScanning();
        
    } catch (error) {
        // Если не удалось с environment, пробуем user (фронтальную)
        if (isMobile && error.name === 'OverconstrainedError') {
            console.log('Пробуем фронтальную камеру...');
            const constraints = {
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    facingMode: { ideal: 'user' }
                },
                audio: false
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            setupVideoElement();
            setupVideoStream();
            startScanning();
        } else {
            throw error;
        }
    }
}

// Настройка видео элемента
function setupVideoElement() {
    qrVideo.setAttribute('autoplay', 'true');
    qrVideo.setAttribute('playsinline', 'true');
    qrVideo.setAttribute('muted', 'true');
    
    // Зеркальное отображение только для фронтальной камеры
    if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        qrVideo.style.transform = settings.facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
    }
}

// Настройка видео потока
function setupVideoStream() {
    qrVideo.srcObject = stream;
    
    return new Promise((resolve) => {
        qrVideo.onloadedmetadata = function() {
            qrVideo.play()
                .then(() => {
                    console.log('Видео запущено успешно');
                    adjustCanvasSize();
                    resolve();
                })
                .catch(error => {
                    console.warn('Ошибка воспроизведения видео:', error);
                    resolve();
                });
        };
        
        setTimeout(resolve, 1000);
    });
}

// Корректировка размера canvas
function adjustCanvasSize() {
    const aspectRatio = qrVideo.videoWidth / qrVideo.videoHeight;
    const maxWidth = Math.min(qrVideo.videoWidth, 800);
    const height = maxWidth / aspectRatio;
    
    qrCanvas.width = maxWidth;
    qrCanvas.height = height;
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
        
        // Рисуем кадр с учетом aspect ratio
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
            // Демо-режим для тестирования
            demoQRRecognition();
        }
    } catch (error) {
        console.error('Ошибка распознавания:', error);
    }
}

// Демо-режим распознавания
function demoQRRecognition() {
    if (Math.random() < 0.05) { // 5% шанс для демо
        const demoData = "https://gamerank.ru/api/auth/qr-code-check/efd2361b-6e89-463c-909e-4e47b03bd351/13441a9fa1d28643df9e2ec3a774b13cf7326c5707492c23b55aa3915ae997c0/25.08.2025%2010:13:34";
        onQRCodeDetected(demoData);
    }
}

async function onQRCodeDetected(data) {
    qrResultText.textContent = data;
    copyQRResultBtn.disabled = false;
    
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    stopQRScanner();
    
    try {
        await processScannedQRCode(data);
    } catch (error) {
        console.error('Ошибка обработки QR кода:', error);
        showError('Ошибка обработки QR кода');
    }
}

// Парсинг и обработка QR кода
async function processScannedQRCode(scannedUrl) {
    try {
        // Парсим URL
        const url = new URL(scannedUrl);
        const segments = url.pathname.split('/').filter(segment => segment !== '');
        
        // segments: ["api", "auth", "qr-code-check", "qr_id", "token", "expires"]
        const qrId = segments[3];     // "efd2361b-6e89-463c-909e-4e47b03bd351"
        const token = segments[4];    // "13441a9fa1d28643df9e2ec3a774b13cf7326c5707492c23b55aa3915ae997c0"
        const expires = decodeURIComponent(segments[5]); // "25.08.2025 10:13:34"

        // Показываем диалог подтверждения
        const shouldConfirm = await showConfirmationDialog("Разрешить вход?", expires);
        
        if (!shouldConfirm) {
            showMessage('Действие отменено');
            return;
        }

        // Получаем токен текущего пользователя
        

        // Отправляем запрос на сервер
        console.log(qrId)
        const requestData = { 
            qrcodeId: qrId, 
            token: token 
        };

        const response = await fetch('https://192.168.0.103/api/auth/qrcode-confirm', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            showMessage('Вход разрешён!');
            await onLoginConfirmed();
        } else {
            const errorData = await response.json().catch(() => ({}));
            showError(errorData.message || 'Ошибка подтверждения');
        }

    } catch (error) {
        console.error('Ошибка парсинга QR кода:', error);
        showError('Неверный формат QR кода');
    }
}

// Показать диалог подтверждения
async function showConfirmationDialog(message, expires) {
    return new Promise((resolve) => {
        // Создаем модальное окно подтверждения
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '10000';
        modal.style.backdropFilter = 'blur(5px)';

        const dialog = document.createElement('div');
        dialog.style.background = 'white';
        dialog.style.padding = '25px';
        dialog.style.borderRadius = '12px';
        dialog.style.textAlign = 'center';
        dialog.style.maxWidth = '350px';
        dialog.style.width = '90%';
        dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

        dialog.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${message}</h3>
            <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Действие действительно до: <strong>${expires}</strong></p>
            <div style="display: flex; gap: 12px; margin-top: 20px; justify-content: center;">
                <button id="confirmYes" style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Разрешить</button>
                <button id="confirmNo" style="padding: 12px 24px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Отмена</button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // Обработчики кнопок
        document.getElementById('confirmYes').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });

        document.getElementById('confirmNo').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(false);
            }
        });
    });
}

// Получение auth token


// Получение токена из cookies
function getTokenFromCookies() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
    
    return cookieValue ? decodeURIComponent(cookieValue) : null;
}

// Действия после успешного подтверждения входа
async function onLoginConfirmed() {
    console.log('Логин подтвержден');
    
    // Показываем сообщение об успехе
    showToast('Вход успешно разрешен!', 'success');
    
    // Закрываем модальное окно через 2 секунды
    setTimeout(() => {
        closeModal();
    }, 2000);
}

// Показать toast сообщение
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '6px';
    toast.style.zIndex = '10001';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.fontSize = '14px';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
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

// Обработка ошибок камеры
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
            errorMessage = 'Требуемая камера недоступна. Используйте другую камеру';
            break;
        case 'SecurityError':
            errorMessage = 'Доступ к камере заблокирован по соображениям безопасности';
            break;
        default:
            errorMessage = `Ошибка: ${error.message || error.name}`;
    }
    
    showError(errorMessage);
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

// Сброс UI
function resetUI() {
    qrResultText.textContent = 'Не сканировано';
    qrResultText.style.color = 'var(--light)';
    copyQRResultBtn.disabled = true;
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
                copyToClipboardFallback(text);
            });
    });
}

function showTempMessage(message) {
    const originalText = qrResultText.textContent;
    const originalColor = qrResultText.style.color;
    
    qrResultText.textContent = message;
    qrResultText.style.color = 'var(--secondary)';
    
    setTimeout(() => {
        qrResultText.textContent = originalText;
        qrResultText.style.color = originalColor;
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

// Глобальная обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});