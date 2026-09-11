// API Configuration - CoinGecko (gratuit, pas d'authentification)
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Mapping des cryptos et devises
const CURRENCIES_MAP = {
    'btc': { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    'eth': { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    'xrp': { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
    'bnb': { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
    'ada': { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
    'sol': { id: 'solana', symbol: 'SOL', name: 'Solana' },
    'doge': { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
    'ltc': { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
    'usdt': { id: 'tether', symbol: 'USDT', name: 'Tether' },
    'usdc': { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
    'usd': { id: 'usd', symbol: 'USD', name: 'US Dollar' },
    'eur': { id: 'eur', symbol: 'EUR', name: 'Euro' }
};

// Cache pour les prix
let priceCache = {};
let lastUpdateTime = 0;
const CACHE_DURATION = 60000; // 1 minute

// Fonction pour récupérer les prix depuis l'API
async function fetchPrices() {
    try {
        const cryptoIds = [
            'bitcoin', 'ethereum', 'ripple', 'binancecoin', 'cardano', 
            'solana', 'dogecoin', 'litecoin', 'tether', 'usd-coin'
        ];
        
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true`
        );
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        // Transformer les données
        const prices = {};
        Object.entries(CURRENCIES_MAP).forEach(([key, currency]) => {
            if (data[currency.id]) {
                prices[key] = {
                    usd: data[currency.id].usd,
                    eur: data[currency.id].eur,
                    change24h: data[currency.id]['usd_24h_change'],
                    marketCap: data[currency.id]['usd_market_cap']
                };
            }
        });
        
        // Ajouter les taux fiat (USD/EUR)
        prices['usd'] = {
            usd: 1,
            eur: 0.92, // Taux approximatif
            change24h: 0
        };
        
        prices['eur'] = {
            usd: 1.09,
            eur: 1,
            change24h: 0
        };
        
        priceCache = prices;
        lastUpdateTime = Date.now();
        
        return prices;
    } catch (error) {
        console.error('Erreur lors de la récupération des prix:', error);
        // Retourner les prix en cache ou des valeurs par défaut
        return priceCache || getDefaultPrices();
    }
}

// Prices par défaut (en cas d'erreur API)
function getDefaultPrices() {
    return {
        'btc': { usd: 42000, eur: 38640, change24h: 2.5, marketCap: 830000000000 },
        'eth': { usd: 2200, eur: 2024, change24h: 1.8, marketCap: 265000000000 },
        'xrp': { usd: 2.50, eur: 2.30, change24h: -0.5, marketCap: 138000000000 },
        'bnb': { usd: 610, eur: 561, change24h: 3.2, marketCap: 93000000000 },
        'ada': { usd: 1.05, eur: 0.97, change24h: 1.2, marketCap: 37000000000 },
        'sol': { usd: 198, eur: 182, change24h: 5.1, marketCap: 63000000000 },
        'doge': { usd: 0.38, eur: 0.35, change24h: -1.5, marketCap: 55000000000 },
        'ltc': { usd: 85, eur: 78, change24h: 2.3, marketCap: 13000000000 },
        'usdt': { usd: 1.00, eur: 0.92, change24h: 0.01, marketCap: 95000000000 },
        'usdc': { usd: 1.00, eur: 0.92, change24h: 0.01, marketCap: 32000000000 },
        'usd': { usd: 1, eur: 0.92, change24h: 0 },
        'eur': { usd: 1.09, eur: 1, change24h: 0 }
    };
}

// Fonction pour obtenir les prix (avec cache)
async function getPrices() {
    if (Date.now() - lastUpdateTime > CACHE_DURATION) {
        return await fetchPrices();
    }
    return priceCache || getDefaultPrices();
}

// Fonction pour convertir une devise à une autre
async function convertCurrency(amount, from, to) {
    const prices = await getPrices();
    
    const fromPrice = prices[from]?.usd || 1;
    const toPrice = prices[to]?.usd || 1;
    
    return (amount * fromPrice) / toPrice;
}

// Fonction pour obtenir les prix historiques (24h)
async function getPriceHistory(cryptoId) {
    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/${cryptoId}/market_chart?vs_currency=usd&days=1&interval=hourly`
        );
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        return data.prices;
    } catch (error) {
        console.error('Erreur historique:', error);
        return [];
    }
}

// Initialiser les prix au chargement
window.addEventListener('load', async () => {
    await fetchPrices();
    
    // Actualiser les prix toutes les minutes
    setInterval(fetchPrices, CACHE_DURATION);
});
