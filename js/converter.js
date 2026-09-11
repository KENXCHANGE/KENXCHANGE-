// Convertisseur de devises

async function updateConverter() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (amount <= 0) {
        document.getElementById('result').value = '0';
        document.getElementById('exchangeRate').textContent = '';
        return;
    }
    
    try {
        const result = await convertCurrency(amount, fromCurrency, toCurrency);
        document.getElementById('result').value = result.toFixed(8);
        
        // Afficher le taux de change
        const prices = await getPrices();
        const rate = prices[toCurrency]?.usd / prices[fromCurrency]?.usd || 1;
        
        const fromName = CURRENCIES_MAP[fromCurrency].symbol;
        const toName = CURRENCIES_MAP[toCurrency].symbol;
        
        document.getElementById('exchangeRate').innerHTML = 
            `<strong>1 ${fromName} = ${rate.toFixed(8)} ${toName}</strong><br><small>Taux en temps réel via CoinGecko</small>`;
    } catch (error) {
        console.error('Erreur conversion:', error);
    }
}

// Fonction pour inverser les devises
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
    
    updateConverter();
}

// Fonction pour scroller vers le convertisseur
function scrollToConverter() {
    document.getElementById('convertisseur').scrollIntoView({ behavior: 'smooth' });
}

// Event listeners
document.getElementById('amount')?.addEventListener('input', updateConverter);
document.getElementById('fromCurrency')?.addEventListener('change', updateConverter);
document.getElementById('toCurrency')?.addEventListener('change', updateConverter);

// Initialiser au chargement
window.addEventListener('load', updateConverter);
