import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, PlusCircle, AlertCircle } from 'lucide-react';

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user'); // Default to customer
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        role
      });

      if (res.data.success) {
        login(res.data.user, res.data.token);
        
        // Redirect depending on role
        if (role === 'manager') {
          navigate('/partner'); // Go direct to Partner onboarding to verify Aadhaar/PAN
        } else {
          navigate('/profile'); // Go to profile to confirm OTP
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative pt-28 pb-20 font-sans overflow-hidden">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute top-[20%] right-[10%] w-[380px] h-[380px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none -z-10 animate-float-slow"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[330px] h-[330px] rounded-full bg-purple-500/8 blur-[90px] pointer-events-none -z-10 animate-float-reverse"></div>

      <div className="w-full max-w-md glass-glow p-8 md:p-10 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-full"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
            <PlusCircle size={20} />
          </div>
          <h2 className="text-3xl font-serif font-black italic text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-xs font-light">Get started with immediate booking approvals and rewards.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2.5 animate-pulse-glow">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[9px] text-indigo-300/70 font-black uppercase tracking-widest block mb-2">Full Name</label>
            <div className="flex items-center bg-slate-950/45 border border-white/5 rounded-2xl p-4 focus-within:border-indigo-500/40 focus-within:bg-slate-950/85 transition-all duration-300 shadow-inner">
              <User size={16} className="text-gray-500 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Rajesh Kumar" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-indigo-300/70 font-black uppercase tracking-widest block mb-2">Email Address</label>
            <div className="flex items-center bg-slate-950/45 border border-white/5 rounded-2xl p-4 focus-within:border-indigo-500/40 focus-within:bg-slate-950/85 transition-all duration-300 shadow-inner">
              <Mail size={16} className="text-gray-500 mr-3 shrink-0" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-indigo-300/70 font-black uppercase tracking-widest block mb-2">Mobile Number</label>
            <div className="flex items-center bg-slate-950/45 border border-white/5 rounded-2xl p-4 focus-within:border-indigo-500/40 focus-within:bg-slate-950/85 transition-all duration-300 shadow-inner">
              <span className="text-gray-500 text-sm font-bold mr-3 shrink-0">+91</span>
              <input 
                type="tel" 
                placeholder="10-digit number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-indigo-300/70 font-black uppercase tracking-widest block mb-2">Password</label>
            <div className="flex items-center bg-slate-950/45 border border-white/5 rounded-2xl p-4 focus-within:border-indigo-500/40 focus-within:bg-slate-950/85 transition-all duration-300 shadow-inner">
              <Lock size={16} className="text-gray-500 mr-3 shrink-0" />
              <input 
                type="password" 
                placeholder="Min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-sm text-white font-medium outline-none w-full placeholder-gray-600"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-indigo-300/70 font-black uppercase tracking-widest block mb-2">Account Role Type</label>
            <div className="flex gap-4 mt-2">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer text-xs transition border ${role === 'user' ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg' : 'bg-slate-950/45 border-white/5 text-gray-400 hover:border-white/10 hover:bg-slate-950/60'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="user" 
                  checked={role === 'user'} 
                  onChange={() => setRole('user')}
                  className="hidden" 
                />
                <span className="font-bold">Customer</span>
              </label>

              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer text-xs transition border ${role === 'manager' ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg' : 'bg-slate-950/45 border-white/5 text-gray-400 hover:border-white/10 hover:bg-slate-950/60'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="manager" 
                  checked={role === 'manager'} 
                  onChange={() => setRole('manager')}
                  className="hidden" 
                />
                <span className="font-bold">Hotel Partner</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 btn-luxury text-white font-bold rounded-2xl transition mt-8 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider shadow-lg"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : <><PlusCircle size={15} /> Create Account</>}
          </button>
        </form>

        <div className="border-t border-white/5 my-8"></div>

        <p className="text-center text-[11px] text-gray-500">
          Already registered? <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
