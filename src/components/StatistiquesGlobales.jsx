import { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { statistiqueService } from '../services/statistiqueService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function StatistiquesGlobales() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        statistiqueService.getDashboardStats().then(setStats);
    }, []);

    if (!stats) return <div>Chargement...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#fff' }}>
                <h3>Répartition par Statut</h3>
                <Pie data={{
                    labels: ['En cours', 'Terminé', 'Bloqué'],
                    datasets: [{ data: [stats.enCours, stats.termine, stats.bloque], backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384'] }]
                }} />
            </div>
            {/* Ajoute d'autres graphiques ici */}
        </div>
    );
}