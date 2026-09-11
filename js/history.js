// Historique des échanges

const HISTORY_KEY = 'exchange_history';

// Ajouter une transaction à l'historique
function addToHistory(amount, from, to, result) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    const transaction = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        amount: parseFloat(amount).toFixed(8),
        from: CURRENCIES_MAP[from].symbol,
        to: CURRENCIES_MAP[to].symbol,
        result: parseFloat(result).toFixed(8)
    };
    
    history.unshift(transaction);
    
    // Garder seulement les 50 dernières transactions
    if (history.length > 50) {
        history.pop();
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

// Afficher l'historique
function displayHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const historyTable = document.getElementById('historyTable');
    
    if (!historyTable) return;
    
    if (history.length === 0) {
        historyTable.innerHTML = '<p class="empty-state">Aucun échange enregistré</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Date & Heure</th>
                    <th>Montant</th>
                    <th>De</th>
                    <th>Vers</th>
                    <th>Résultat</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    history.forEach(tx => {
        html += `
            <tr>
                <td>${tx.timestamp}</td>
                <td>${tx.amount}</td>
                <td>${tx.from}</td>
                <td>${tx.to}</td>
                <td>${tx.result}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    historyTable.innerHTML = html;
}

// Effacer l'historique
function clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer l\'historique ?')) {
        localStorage.removeItem(HISTORY_KEY);
        displayHistory();
    }
}

// Modifier le convertisseur pour enregistrer les transactions
const originalUpdateConverter = updateConverter;
updateConverter = async function() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const result = document.getElementById('result').value;
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;
    
    await originalUpdateConverter();
    
    if (amount > 0 && result) {
        // Enregistrer après un court délai pour éviter les doublons
        setTimeout(() => {
            const currentResult = document.getElementById('result').value;
            if (currentResult !== result) {
                addToHistory(amount, from, to, currentResult);
            }
        }, 1000);
    }
};

// Afficher l'historique au chargement
window.addEventListener('load', displayHistory);
