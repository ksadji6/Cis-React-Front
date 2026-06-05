export const Checklist = ({ prerequis, onToggle }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
    <h4 style={{ margin: '0 0 15px 0' }}>Validation des Prérequis</h4>
    {prerequis.map((item) => (
      <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <input 
          type="checkbox" 
          checked={item.estDisponible} 
          onChange={() => onToggle(item.id)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ marginLeft: '10px', fontSize: '14px', color: item.estDisponible ? '#10b981' : '#475569' }}>
          {item.libelle}
        </span>
      </div>
    ))}
  </div>
);