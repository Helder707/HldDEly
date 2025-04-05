let cart = [];
let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
let currentLanguage = 'en';

const translations = {
    en: {
        title: "Hel Delyfoods Restaurant Menu",
        menu: "Our Menu",
        entrances: "Entrances",
        mains: "Main Foods",
        desserts: "Desserts",
        coldDrinks: "Cold Drinks",
        hotDrinks: "Hot Drinks",
        cart: "Your Cart",
        total: "Total",
        purchase: "Purchase",
        cancel: "Cancel",
        success: "Purchase Successfully Completed",
        history: "Purchase History",
        addToCart: "Add to Cart",
        purchaseDetails: "Purchase Details",
        clearHistory: "Clear History",
        cancelOrder: "Cancel Order"
    },
    pt: {
        title: "Menu do Restaurante Hel Delyfoods",
        menu: "Nosso Menu",
        entrances: "Entradas",
        mains: "Pratos Principais",
        desserts: "Sobremesas",
        coldDrinks: "Bebidas Frias",
        hotDrinks: "Bebidas Quentes",
        cart: "Seu Carrinho",
        total: "Total",
        purchase: "Comprar",
        cancel: "Cancelar",
        success: "Compra Concluída com Sucesso",
        history: "Histórico de Compras",
        addToCart: "Adicionar ao Carrinho",
        purchaseDetails: "Detalhes da Compra",
        clearHistory: "Limpar Histórico",
        cancelOrder: "Cancelar Pedido"
    },
    fr: {
        title: "Menu du Restaurant Hel Delyfoods",
        menu: "Notre Menu",
        entrances: "Entrées",
        mains: "Plats Principaux",
        desserts: "Desserts",
        coldDrinks: "Boissons Froides",
        hotDrinks: "Boissons Chaudes",
        cart: "Votre Panier",
        total: "Total",
        purchase: "Acheter",
        cancel: "Annuler",
        success: "Achat Réussi",
        history: "Historique des Achats",
        addToCart: "Ajouter au Panier",
        purchaseDetails: "Détails de l'Achat",
        clearHistory: "Effacer l'Historique",
        cancelOrder: "Annuler la Commande"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    updatePurchaseHistory();

    document.querySelectorAll('.menu-toggle button').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            showSection(section);
        });
    });

    document.querySelectorAll('.menu-item button').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.getAttribute('data-item');
            const price = parseFloat(button.getAttribute('data-price'));
            addToCart(item, price);
        });
    });

    const languageBtn = document.querySelector('.language-btn');
    const dropdown = document.querySelector('.language-dropdown');
    languageBtn.addEventListener('click', () => {
        dropdown.classList.toggle('active');
    });

    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            setLanguage(lang);
            dropdown.classList.remove('active');
        });
    });

    const purchaseBtn = document.getElementById('purchaseBtn');
    const historyDropdown = document.getElementById('purchaseHistoryDropdown');
    purchaseBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            historyDropdown.classList.toggle('active');
        } else {
            confirmPurchase();
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', cancelCart);
    document.getElementById('closeThankYouBtn').addEventListener('click', closeThankYouMessage);
    document.querySelector('.close-details').addEventListener('click', closePurchaseDetails);
    document.querySelector('.clear-history').addEventListener('click', clearPurchaseHistory);

    showSection('entrances');
    updateLanguage();
});

function setLanguage(lang) {
    currentLanguage = lang;
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLanguage];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.menu-title').textContent = t.menu;
    document.querySelector('#entrances h2').textContent = t.entrances;
    document.querySelector('#mains h2').textContent = t.mains;
    document.querySelector('#desserts h2').textContent = t.desserts;
    document.querySelector('#coldDrinks h2').textContent = t.coldDrinks;
    document.querySelector('#hotDrinks h2').textContent = t.hotDrinks;
    document.querySelector('#cartListBox h4').textContent = t.cart;
    document.querySelector('#cartTotal').textContent = `${t.total}: $0`;
    document.getElementById('purchaseBtn').textContent = t.purchase;
    document.getElementById('cancelBtn').textContent = t.cancel;
    document.querySelector('#thankYouMessage p').textContent = t.success;
    document.querySelector('#purchaseHistoryDropdown h3').textContent = t.history;
    document.querySelector('#purchaseDetails h3').textContent = t.purchaseDetails;
    document.querySelector('.clear-history').textContent = t.clearHistory;
    document.querySelectorAll('.menu-item button').forEach(btn => btn.textContent = t.addToCart);
    document.querySelectorAll('.cancel-order-btn').forEach(btn => btn.textContent = t.cancelOrder);
}

function showSection(sectionId) {
    document.querySelectorAll('.menu-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function addToCart(item, price) {
    if (price <= 0) {
        alert('Invalid item price!');
        return;
    }
    cart.push({ item, price });
    updateCartListBox();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartListBox();
}

function updateCartListBox() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        document.getElementById('cartListBox').classList.remove('active');
    } else {
        document.getElementById('cartListBox').classList.add('active');
        cart.forEach((cartItem, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <span>${cartItem.item} - $${cartItem.price}</span>
                <button class="remove-btn" data-index="${index}">-</button>
            `;
            cartList.appendChild(li);
            total += cartItem.price;
        });
        document.getElementById('cartTotal').textContent = `${translations[currentLanguage].total}: $${total}`;

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }
}

async function confirmPurchase() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total <= 0) {
        alert('Invalid purchase total!');
        return;
    }

    const response = await new Promise(resolve => {
        setTimeout(() => resolve({ orderId: Math.floor(Math.random() * 1000) }), 500);
    });

    const purchase = {
        orderId: response.orderId,
        dateTime: new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        }),
        items: [...cart],
        total: total
    };
    purchaseHistory.push(purchase);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
    updatePurchaseHistory();

    cart = [];
    updateCartListBox();
    const thankYouMessage = document.getElementById('thankYouMessage');
    thankYouMessage.classList.add('active');
    setTimeout(() => {
        thankYouMessage.classList.remove('active');
        showPurchaseDetails();
    }, 3000);
}

function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        purchaseHistory = purchaseHistory.filter(purchase => purchase.orderId !== orderId);
        localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        updatePurchaseHistory();
        showPurchaseDetails();
    }
}

function showPurchaseDetails() {
    const detailsList = document.getElementById('purchaseDetailsList');
    detailsList.innerHTML = '';

    purchaseHistory.forEach(purchase => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Order #${purchase.orderId}</strong><br>
            Date & Time: ${purchase.dateTime}<br>
            Total: $${purchase.total}<br>
            Items: ${purchase.items.map(item => `${item.item} ($${item.price})`).join(', ')}<br>
            <hr>
        `;
        detailsList.appendChild(li);
    });

    document.getElementById('purchaseDetails').classList.add('active');
}

function closePurchaseDetails() {
    document.getElementById('purchaseDetails').classList.remove('active');
}

function clearPurchaseHistory() {
    if (confirm('Are you sure you want to clear your purchase history?')) {
        purchaseHistory = [];
        localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        updatePurchaseHistory();
        document.getElementById('purchaseDetailsList').innerHTML = '';
        document.getElementById('purchaseDetails').classList.remove('active');
    }
}

function cancelCart() {
    if (cart.length > 0) {
        if (confirm('Are you sure you want to cancel your order?')) {
            cart = [];
            updateCartListBox();
        }
    }
}

function closeThankYouMessage() {
    document.getElementById('thankYouMessage').classList.remove('active');
    showPurchaseDetails();
}

function updatePurchaseHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    purchaseHistory.forEach(purchase => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <strong>Order #${purchase.orderId}</strong><br>
            Date & Time: ${purchase.dateTime}<br>
            Total: $${purchase.total}<br>
            Items: ${purchase.items.map(item => item.item).join(', ')}<br>
            <button class="cancel-order-btn" data-order-id="${purchase.orderId}">${translations[currentLanguage].cancelOrder}</button>
            <hr>
        `;
        historyList.appendChild(li);
    });

    document.querySelectorAll('.cancel-order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = parseInt(btn.getAttribute('data-order-id'));
            cancelOrder(orderId);
        });
    });
}