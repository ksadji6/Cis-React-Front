import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { documentService } from '../services/documentService';

export default function RapportSuperviseur() {
    const [projets, setProjets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [docsByProject, setDocsByProject] = useState({});

    const PHASE_STYLES = {
        'PRE_PROJET': { bg: '#fffbf0', color: '#c8a800', border: '#fcd63c' },
        'PROJET':     { bg: '#e8f0fe', color: '#1a5fb4', border: '#1a5fb4' },
        'POST_PROJET':{ bg: '#e8f7ee', color: '#1a6b38', border: '#20ab4b' }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await projectService.getAllProjects();
                setProjets(Array.isArray(data) ? data : []);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
    }, []);

    const toggleDocs = async (projectId) => {
        if (docsByProject[projectId]) {
            setDocsByProject(prev => ({ ...prev, [projectId]: null }));
        } else {
            const docs = await documentService.getByProjectId(projectId);
            setDocsByProject(prev => ({ ...prev, [projectId]: docs }));
        }
    };

    if (loading) return <div className="cis-card">Chargement des rapports...</div>;

    return (
        <div className="cis-main">
            <div className="cis-page-header">
                <h1 className="cis-page-title">Rapport de Supervision</h1>
            </div>

            {projets.length === 0 ? (
                <div className="cis-card">Aucun projet trouvé.</div>
            ) : (
                projets.map(p => {
                    // On définit le style ici, à l'intérieur de la boucle
                    const style = PHASE_STYLES[p.phase] || { bg: '#f5f5f5', color: '#666', border: '#ccc' };
                    
                    return (
                        <div key={p.id} className="cis-card" style={{ marginBottom: '15px', borderLeft: `6px solid ${style.border}` }}>
                            {/* Header de la carte */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <h3 onClick={() => toggleDocs(p.id)} style={{ cursor: 'pointer', fontSize: '16px', margin: 0 }}>
                                    {p.titre} {docsByProject[p.id] ? '▼' : '▶'}
                                </h3>
                                {/* Badge phase dynamique */}
                                <span style={{ 
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                    backgroundColor: style.bg, color: style.color
                                }}>
                                    {p.phase}
                                </span>
                            </div>

                            {/* Informations */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <div className="cis-badge badge-gray">Statut : {p.statut}</div>
                                <div className="cis-badge badge-blue">Avancement : {p.avancement}%</div>
                            </div>

                            {/* Section Documents */}
                            {docsByProject[p.id] && (
                                <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <h4 style={{ fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', color: '#888' }}>Documents associés</h4>
                                    {docsByProject[p.id].length === 0 ? <p style={{ fontSize: '12px' }}>Aucun document.</p> :
                                        docsByProject[p.id].map(doc => (
                                            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                                <span style={{ fontSize: '13px' }}>{doc.fileName}</span>
                                                <button className="cis-btn cis-btn-ghost cis-btn-sm" 
                                                        onClick={() => documentService.download(doc.id, doc.fileName)}>
                                                    <i className="ti ti-download"></i> Télécharger
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}