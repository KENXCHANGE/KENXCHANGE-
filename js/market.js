// Section Marché - Affichage des taux de change

async function displayMarket() {
    try {
        const prices = await getPrices();
        const marketGrid = document.getElementById('marketGrid');
        
        if (!marketGrid) return;
        
        marketGrid.innerHTML = '';
        
        // Afficher toutes les cryptos
        const cryptosToShow = ['btc', 'eth', 'xrp', 'bnb', 'ada', 'sol', 'doge', 'ltc', 'usdt', 'usdc'];
        
        cryptosToShow.forEach(cryptoKey => {
            const currency = CURRENCIES_MAP[cryptoKey];
            const price = prices[cryptoKey];
            
            if (!price) return;
            
            const card = document.createElement('div');
            card.className = 'market-card';
            
            const change = price.change24h || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeIcon = change >= 0 ? '📈' : '📉';
            
            card.innerHTML = `
                <div class="market-card-header">
                    <div>
                        <div class="market-card-title">${currency.name}</div>
                        <div class="market-card-code">${currency.symbol}</div>
                    </div>
                </div>
                <div class="market-card-price">$${price.usd.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>
                <div class="market-card-change">
                    <span class="change-24h ${changeClass}">${changeIcon} ${change.toFixed(2)}% (24h)</span>
                </div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: #95a5a6;">
                    <strong>EUR:</strong> €${price.eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </div>
            `;
            
            marketGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Erreur affichage marché:', error);
    }
}

// Actualiser le marché au chargement et toutes les minutes
window.addEventListener('load', () => {
    displayMarket();
    setInterval(displayMarket, 60000);
});
