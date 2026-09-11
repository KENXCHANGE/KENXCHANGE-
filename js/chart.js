// Graphiques - Tendances 24h

let chartInstance = null;

async function displayChart() {
    try {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        
        // Récupérer l'historique du Bitcoin (coin majeur)
        const history = await getPriceHistory('bitcoin');
        
        if (history.length === 0) {
            console.warn('Pas de données historiques');
            return;
        }
        
        // Transformer les données
        const labels = history.map(item => {
            const date = new Date(item[0]);
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        });
        
        const prices = history.map(item => item[1]);
        
        // Détruire le graphique précédent
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Créer le nouveau graphique
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Prix du Bitcoin (USD)',
                    data: prices,
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#ffd700',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ecf0f1',
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: '#95a5a6',
                            callback: function(value) {
                                return '$' + value.toLocaleString('fr-FR');
                            }
                        },
                        grid: {
                            color: 'rgba(255, 215, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#95a5a6'
                        },
                        grid: {
                            color: 'rgba(255, 215, 0, 0.05)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erreur graphique:', error);
    }
}

// Afficher le graphique au chargement
window.addEventListener('load', () => {
    setTimeout(displayChart, 500);
});
