import { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#20ab4b', '#ec8549', '#1a5fb4'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    projectService.getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <div className="cis-empty">Chargement des données...</div>;

  return (
    <div className="cis-content">
      <h1 className="cis-page-title" style={{ marginBottom: '24px' }}>Tableau de bord de suivi</h1>
      
      {/* KPIs */}
      <div className="cis-grid-3" style={{ marginBottom: '24px' }}>
        <div className="cis-card">
          <h4>Total Projets</h4>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2a' }}>{stats.totalProjets}</p>
        </div>
        <div className="cis-card">
          <h4>Projets Bloqués</h4>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{stats.projetsBloques}</p>
        </div>
        <div className="cis-card">
          <h4>Avancement Moyen</h4>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#20ab4b' }}>{stats.avancementMoyenGlobal.toFixed(0)}%</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="cis-card">
          <h3>Projets par Phase</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.projetsParPhase).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82a806" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cis-card">
          <h3>Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={Object.entries(stats.repartitionParCategorie).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" outerRadius={80} label>
                {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="cis-card" style={{ marginTop: '20px' }}>
        <h3>Tendance des Tâches Terminées </h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={Object.entries(stats.tendanceAvancement).map(([date, count]) => ({ date, count }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#20ab4b" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>
        </div>
        <div className="cis-card" style={{ marginTop: '20px' }}>
            <h3>Charge de travail par Ingénieur</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(stats.chargeTravailParIngenieur).map(([name, statuts]) => ({
                name,
                ...statuts // Spread les statuts: { A_FAIRE: 2, EN_COURS: 1, ... }
                }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="A_FAIRE" stackId="a" fill="#a84444" />
                <Bar dataKey="EN_COURS" stackId="a" fill="#ff6b15" />
                <Bar dataKey="TERMINE" stackId="a" fill="#02e049" />
                </BarChart>
            </ResponsiveContainer>
            </div>
      </div>
      
    </div>
    
  );
}