document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const amountOptions = document.querySelectorAll('.amount-option');
    const customAmountInput = document.getElementById('customAmount');
    const savedCardsContainer = document.getElementById('savedCards');
    const manualCardBtn = document.getElementById('manualCardBtn');
    const cardForm = document.getElementById('cardForm');
    const donateBtn = document.getElementById('donateBtn');
    const cyberAlert = document.getElementById('cyberAlert');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlert = document.getElementById('closeAlert');
    
    // Текущие данные формы
    let selectedAmount = 0;
    let selectedPaymentMethod = null;
    let isManualCard = false;
    let savedCards = [];
    
    // API endpoints
    const API_BASE_URL = 'https://192.168.0.103/api3';
    const SAVE_CARD_ENDPOINT = `${API_BASE_URL}/addpayment/addcard`;
    const GET_CARDS_ENDPOINT = `${API_BASE_URL}/addpayment/getcard`;
    const DELETE_CARD_ENDPOINT = `${API_BASE_URL}/addpayment/deletecard`;
    const PROCESS_DONATION_ENDPOINT = `${API_BASE_URL}/donate`;
    
    // Инициализация
    initDonatePage();
    
    function initDonatePage() {
        // Загружаем сохраненные карты с бэкенда
        loadSavedCards();
        
        // Настройка обработчиков событий
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Обработчики для выбора суммы
        amountOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectAmountOption(this);
            });
        });
        
        // Обработчик для пользовательской суммы
        customAmountInput.addEventListener('input', function() {
            handleCustomAmount(this.value);
        });
        
        // Обработчик для кнопки ввода карты вручную
        manualCardBtn.addEventListener('click', function() {
            toggleManualCardForm();
        });
        
        // Обработчик для кнопки пожертвования
        donateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processDonation();
        });
        
        // Обработчики для форматирования ввода карты
        document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
        document.getElementById('cardExpiry').addEventListener('input', formatCardExpiry);
        document.getElementById('cardCvc').addEventListener('input', formatCardCvc);
        
        // Обработчик для закрытия уведомления
        closeAlert.addEventListener('click', function() {
            hideAlert();
        });
    }
    
    async function loadSavedCards() {
        try {
            showAlert('Загрузка сохраненных карт...', 'info');
            
            const response = await fetch("https://192.168.0.103/api3/addpayment/getcard", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            // Проверяем, что ответ JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Сервер вернул не JSON:', text.substring(0, 200));
                throw new Error('Сервер вернул неверный формат данных');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Полученные данные с сервера:', data);
            
            // Исправленная обработка данных - теперь data.cards (с маленькой буквы)
            if (!data.cards || data.cards.length === 0 || data.cards === "null") {
                savedCards = [];
                savedCardsContainer.innerHTML = '<p class="no-cards">У вас нет сохраненных карт</p>';
            } else {
                // Преобразуем массив номеров карт в формат для отображения
                // Показываем только последние 4 цифры для безопасности
                savedCards = data.cards.map(cardNumber => {
                    // Оставляем только последние 4 цифры, остальные заменяем на *
                    const maskedNumber = '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
                    
                    return {
                        cardNumber: cardNumber, // сохраняем полный номер для операций
                        displayNumber: maskedNumber, // маскированный номер для показа
                        lastFour: cardNumber.slice(-4), // только последние 4 цифры
                        brand: detectCardBrand(cardNumber),
                        cardExpiration: '--/--',
                        cardHolderName: 'Владелец карты'
                    };
                });
                
                renderSavedCards();
            }
            
            hideAlert();
            
        } catch (error) {
            console.error('Ошибка при загрузке карт:', error);
            showAlert('Не удалось загрузить сохраненные карты: ' + error.message, 'error');
            savedCardsContainer.innerHTML = '<p class="no-cards">Ошибка загрузки карт</p>';
        }
    }
    
    function detectCardBrand(cardNumber) {
        // Убираем все нецифровые символы
        const cleanNumber = cardNumber.replace(/\D/g, '');
        const firstDigit = cleanNumber.charAt(0);
        
        switch(firstDigit) {
            case '4': return 'visa';
            case '5': return 'mastercard';
            case '3': 
                // American Express начинается с 34 или 37
                return (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) ? 'amex' : 'unknown';
            case '6': return 'discover';
            default: return 'unknown';
        }
    }
    
    function renderSavedCards() {
        savedCardsContainer.innerHTML = '';
        
        if (savedCards.length > 0) {
            savedCards.forEach(card => {
                const cardElement = createSavedCardElement(card);
                savedCardsContainer.appendChild(cardElement);
            });
            
            addDeleteCardHandlers();
        } else {
            savedCardsContainer.innerHTML = '<p class="no-cards">У вас нет сохраненных карт</p>';
        }
    }
    
    function createSavedCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'saved-card';
        cardDiv.dataset.cardNumber = card.cardNumber; // сохраняем полный номер для операций
        
        const brandIcon = getCardBrandIcon(card.brand);
        
        cardDiv.innerHTML = `
            <div class="card-icon">
                <i class="${brandIcon}"></i>
            </div>
            <div class="card-details">
                <div class="card-number">${card.displayNumber}</div>
                
            </div>
            <button class="delete-card-btn" data-card-number="${card.cardNumber}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cardDiv.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-card-btn')) {
                selectSavedCard(this, card);
            }
        });
        
        return cardDiv;
    }
    
    function addDeleteCardHandlers() {
        const deleteButtons = document.querySelectorAll('.delete-card-btn');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', async function(e) {
                e.stopPropagation();
                
                const cardNumber = this.dataset.cardNumber;
                const cardElement = this.closest('.saved-card');
                
                if (confirm('Вы уверены, что хотите удалить эту карту?')) {
                    await deleteCard(cardNumber, cardElement);
                }
            });
        });
    }
    
    async function deleteCard(cardNumber, cardElement) {
        try {
            showAlert('Удаление карты...', 'info');
            
            const response = await fetch(DELETE_CARD_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(cardNumber)
            });
            
            // Проверяем тип ответа
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Сервер вернул не JSON при удалении:', text.substring(0, 200));
                throw new Error('Сервер вернул неверный формат данных');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            cardElement.remove();
            savedCards = savedCards.filter(card => card.cardNumber !== cardNumber);
            
            showAlert(result.Message || 'Карта успешно удалена', 'success');
            
            if (selectedPaymentMethod && selectedPaymentMethod.cardNumber === cardNumber) {
                selectedPaymentMethod = null;
            }
            
        } catch (error) {
            console.error('Ошибка при удалении карты:', error);
            showAlert(error.message || 'Не удалось удалить карту', 'error');
        }
    }
    
    async function saveCard(cardData) {
        try {
            // Преобразуем срок действия из формата ММ/ГГ в цельное число (MMYY)
            const expiryWithoutSlash = cardData.expiry.replace('/', '');
            
            const cardPayload = {
                CardNumber: cardData.number,
                CardHolderName: cardData.holder,
                CardExpiration: expiryWithoutSlash, // Отправляем без слеша
                CardSecurityNumber: cardData.cvc
            };
            
            console.log('Отправляемые данные карты:', cardPayload);
            
            const response = await fetch(SAVE_CARD_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(cardPayload)
            });
            
            // Проверяем тип ответа
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Сервер вернул не JSON при сохранении:', text.substring(0, 200));
                throw new Error('Сервер вернул неверный формат данных');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Ошибка при сохранении карты:', error);
            throw error;
        }
    }
    
    function getCardBrandIcon(brand) {
        switch(brand) {
            case 'visa':
                return 'fab fa-cc-visa';
            case 'mastercard':
                return 'fab fa-cc-mastercard';
            case 'amex':
                return 'fab fa-cc-amex';
            case 'discover':
                return 'fab fa-cc-discover';
            default:
                return 'fas fa-credit-card';
        }
    }
    
    function selectAmountOption(option) {
        amountOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedAmount = parseInt(option.dataset.amount);
        customAmountInput.value = '';
    }
    
    function handleCustomAmount(value) {
        if (value) {
            amountOptions.forEach(opt => opt.classList.remove('active'));
            selectedAmount = parseInt(value);
        }
    }
    
    function selectSavedCard(cardElement, card) {
        document.querySelectorAll('.saved-card').forEach(c => c.classList.remove('active'));
        cardElement.classList.add('active');
        selectedPaymentMethod = card;
        isManualCard = false;
        cardForm.style.display = 'none';
    }
    
    function toggleManualCardForm() {
        if (cardForm.style.display === 'none') {
            cardForm.style.display = 'block';
            document.querySelectorAll('.saved-card').forEach(c => c.classList.remove('active'));
            isManualCard = true;
            selectedPaymentMethod = null;
        } else {
            cardForm.style.display = 'none';
        }
    }
    
    function formatCardNumber(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let matches = value.match(/\d{4,16}/g);
        let match = matches && matches[0] || '';
        let parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            e.target.value = parts.join(' ');
        } else {
            e.target.value = value;
        }
    }
    
    function formatCardExpiry(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (value.length >= 2) {
            // Форматируем как ММ/ГГ для удобства пользователя
            e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
    }
    
    function formatCardCvc(e) {
        e.target.value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    }
    
    function validateForm() {
        if (!selectedAmount || selectedAmount < 10) {
            showAlert('Пожалуйста, выберите сумму не менее 10 рублей', 'error');
            return false;
        }
        
        if (!selectedPaymentMethod && !isManualCard) {
            showAlert('Пожалуйста, выберите способ оплаты', 'error');
            return false;
        }
        
        if (isManualCard) {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCvc = document.getElementById('cardCvc').value;
            const cardHolder = document.getElementById('cardHolder').value;
            
            if (!cardNumber || cardNumber.length < 16) {
                showAlert('Пожалуйста, введите корректный номер карты', 'error');
                return false;
            }
            
            // Проверяем срок действия в формате ММ/ГГ
            if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                showAlert('Пожалуйста, введите корректный срок действия карты (ММ/ГГ)', 'error');
                return false;
            }
            
            if (!cardCvc || cardCvc.length < 3) {
                showAlert('Пожалуйста, введите корректный CVC/CVV код', 'error');
                return false;
            }
            
            if (!cardHolder || cardHolder.length < 2) {
                showAlert('Пожалуйста, введите имя владельца карты', 'error');
                return false;
            }
            
            selectedPaymentMethod = {
                number: cardNumber,
                expiry: cardExpiry, // Сохраняем в формате ММ/ГГ для валидации
                cvc: cardCvc,
                holder: cardHolder,
                save: document.getElementById('saveCard').checked
            };
        }
        
        return true;
    }
    
    async function processDonation() {
        if (!validateForm()) {
            return;
        }
        
        donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
        donateBtn.disabled = true;
        
        try {
            if (isManualCard && selectedPaymentMethod.save) {
                try {
                    const saveResult = await saveCard(selectedPaymentMethod);
                    showAlert(saveResult.Message || 'Карта успешно сохранена', 'success');
                } catch (error) {
                    console.error('Ошибка при сохранении карты:', error);
                    showAlert(error.message || 'Не удалось сохранить карту, но платеж будет обработан', 'warning');
                }
            }
            
            // Имитация успешного платежа
            setTimeout(() => {
                showAlert(`Спасибо за вашу поддержку в размере ${selectedAmount} рублей!`, 'success');
                resetForm();
                
                if (isManualCard && selectedPaymentMethod.save) {
                    loadSavedCards();
                }
                
                donateBtn.innerHTML = '<i class="fas fa-heart"></i> Поддержать проект';
                donateBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка при обработке пожертвования:', error);
            showAlert('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.', 'error');
            
            donateBtn.innerHTML = '<i class="fas fa-heart"></i> Поддержать проект';
            donateBtn.disabled = false;
        }
    }
    
    function resetForm() {
        amountOptions.forEach(opt => opt.classList.remove('active'));
        customAmountInput.value = '';
        selectedAmount = 0;
        
        document.querySelectorAll('.saved-card').forEach(c => c.classList.remove('active'));
        cardForm.style.display = 'none';
        isManualCard = false;
        selectedPaymentMethod = null;
        
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvc').value = '';
        document.getElementById('cardHolder').value = '';
        document.getElementById('saveCard').checked = false;
    }
    
    function showAlert(message, type) {
        alertMessage.textContent = message;
        cyberAlert.className = `cyber-alert ${type} active`;
        
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }
    
    function hideAlert() {
        cyberAlert.classList.remove('active');
        cyberAlert.classList.add('hiding');
        
        setTimeout(() => {
            cyberAlert.classList.remove('hiding');
        }, 500);
    }
    
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
});