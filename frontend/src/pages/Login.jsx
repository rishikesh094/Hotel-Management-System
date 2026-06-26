import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        
        // Redirect depending on user role
        if (res.data.user.role === 'manager') {
          navigate('/manager');
        } else if (res.data.user.role === 'admin' || res.data.user.role === 'super_admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative pt-24 font-body-md overflow-hidden text-on-surface">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,17,40,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,17,40,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

      <div className="w-full max-w-md bg-surface-container-lowest p-8 md:p-10 rounded-[32px] border border-platinum-gray/50 shadow-2xl relative animate-in fade-in slide-in-from-bottom-6 duration-700 card-shadow">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-steward-gold rounded-t-full"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-bright border border-platinum-gray/50 text-heritage-navy mb-4 shadow-sm">
            <LogIn size={20} />
          </div>
          <h2 className="text-3xl font-headline-lg font-black text-heritage-navy mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant font-body-sm text-xs font-light">Sign in to book custom stays and review listings.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error font-body-sm text-xs rounded-2xl flex items-center gap-2.5 shadow-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-body-sm">
          <div>
            <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Email Address</label>
            <div className="flex items-center bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 focus-within:border-steward-gold focus-within:bg-surface-container-lowest transition-all duration-300 shadow-sm">
              <Mail size={16} className="text-on-surface-variant mr-3 shrink-0" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm text-heritage-navy font-semibold outline-none w-full placeholder-platinum-gray"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Password</label>
            <div className="flex items-center bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 focus-within:border-steward-gold focus-within:bg-surface-container-lowest transition-all duration-300 shadow-sm">
              <Lock size={16} className="text-on-surface-variant mr-3 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-sm text-heritage-navy font-semibold outline-none w-full placeholder-platinum-gray"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-heritage-navy text-linen-white font-label-md font-bold rounded-2xl hover:bg-primary-container transition mt-8 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider shadow-lg"
            disabled={loading}
          >
            {loading ? 'Signing In...' : <><LogIn size={15} /> Sign In</>}
          </button>
        </form>

        <div className="border-t border-platinum-gray/30 my-8"></div>

        <p className="text-center font-body-sm text-[11px] text-on-surface-variant">
          Don't have an account? <Link to="/register" className="text-steward-gold font-bold hover:underline transition-colors">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}
