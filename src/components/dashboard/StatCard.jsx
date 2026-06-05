export const StatCard = ({ title, value, color, icon }) => (
  <div style={{ 
    backgroundColor: '#fff', padding: '20px', borderRadius: '12px', 
    borderLeft: `5px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <div>
      <span style={{ fontSize: '15px', color: '#e39402cd', textTransform: 'uppercase', fontWeight: '800' }}>{title}</span>
      <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#1e293b' }}>{value}</h3>
    </div>
    
    {/* Utilisation de l'icône ici */}
    {icon && (
      <div style={{ fontSize: '24px', opacity: 0.6 }}>{icon}</div>
    )}
  </div>
);