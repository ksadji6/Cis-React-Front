import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ email, password: password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ user: data.user }));
      const role = data?.user?.role;
      const routes = {
        ADMIN: '/admin/dashboard',
        CHEF_PROJET: '/cprojet/dashboard',
        INGENIEUR: '/ingenieur/dashboard',
        PRESALES: '/presales/dashboard',
        SUPERVISEUR: '/superviseur/dashboard',
      };
      navigate(routes[role] || '/');
    } catch (e) {
      setError(e?.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>

      {/* Panel gauche — branding CIS */}
      <div style={{
        width:'42%',
        background:'#1a1a2a',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        padding:'48px 52px',
        position:'relative',
        overflow:'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(32,171,75,0.07)' }}></div>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(236,133,73,0.07)' }}></div>

        {/* Logo */}
        <div style={{ marginBottom:52 }}>
          <div style={{ width:48, height:48, background:'#20ab4b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <i className="ti ti-building-factory-2" style={{ color:'#fff', fontSize:26 }} aria-hidden="true"></i>
          </div>
          <div style={{ color:'#fff', fontSize:22, fontWeight:700, letterSpacing:'-0.3px' }}>CIS Integration</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>Plateforme de gestion de projets</div>
        </div>

        {/* Features */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {[
            { icon:'ti-folder', color:'#20ab4b', bg:'rgba(32,171,75,0.15)', title:'Gestion de projets', sub:'Pilotez vos projets de bout en bout' },
            { icon:'ti-users', color:'#ec8549', bg:'rgba(236,133,73,0.15)', title:'Collaboration d\'équipe', sub:'Coordonnez ingénieurs et chefs de projet' },
            { icon:'ti-chart-bar', color:'#fcd63c', bg:'rgba(252,214,60,0.12)', title:'Tableaux de bord', sub:'Suivez les KPIs en temps réel' },
          ].map(f => (
            <div key={f.icon} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:38, height:38, background:f.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${f.icon}`} style={{ color:f.color, fontSize:18 }} aria-hidden="true"></i>
              </div>
              <div>
                <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:500 }}>{f.title}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div style={{
        flex:1,
        background:'#f4f5f7',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:40,
      }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#1a1a2a', marginBottom:6 }}>Connexion</h1>
            <p style={{ color:'#888', fontSize:13 }}>Accédez à votre espace de travail</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:12, color:'#c0392b', display:'flex', gap:8, alignItems:'center' }}>
                <i className="ti ti-alert-circle" aria-hidden="true"></i>
                {error}
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@cis-si.com"
                autoComplete="email"
                style={{
                  width:'100%', padding:'11px 14px', border:'1px solid #ddd', borderRadius:8,
                  fontSize:13, color:'#1a1a2a', background:'#fff', outline:'none',
                  transition:'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#20ab4b'; e.target.style.boxShadow = '0 0 0 3px rgba(32,171,75,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width:'100%', padding:'11px 14px', border:'1px solid #ddd', borderRadius:8,
                  fontSize:13, color:'#1a1a2a', background:'#fff', outline:'none',
                  transition:'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#20ab4b'; e.target.style.boxShadow = '0 0 0 3px rgba(32,171,75,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', padding:'12px', background: loading ? '#93d4ad' : '#20ab4b',
                color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.15s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.5)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="ti ti-login" aria-hidden="true"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:11, color:'#aaa', marginTop:28 }}>
            CIS Integration · Dakar, Sénégal
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}