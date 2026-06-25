import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Mail, Calendar, Key, ShieldCheck, AlertTriangle, ArrowRightLeft, XCircle, Clock } from 'lucide-react';

export default function UserProfile() {
  const { user, token, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phone Verification States
  const [phone, setPhone] = useState(user?.phone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneMsg, setPhoneMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [token]);

  // Request SMS OTP
  const sendVerificationOtp = async (e) => {
    e.preventDefault();
    setPhoneMsg('');
    setPhoneError('');
    try {
      // First save phone number if changed
      if (phone !== user.phone) {
        await api.put('/auth/me', { phone });
        updateUserProfile({ phone });
      }

      const res = await api.post('/auth/send-otp', { phone });
      if (res.data.success) {
        setOtpSent(true);
        setPhoneMsg('Verification OTP dispatched! Check your console/SMS log.');
      }
    } catch (err) {
      setPhoneError(err.response?.data?.error || 'Failed to dispatch OTP code');
    }
  };

  // Submit OTP Verification code
  const verifyVerificationOtp = async (e) => {
    e.preventDefault();
    setPhoneMsg('');
    setPhoneError('');
    try {
      const res = await api.post('/auth/verify-otp', { otp: otpCode });
      if (res.data.success) {
        updateUserProfile({ isPhoneVerified: true });
        setOtpSent(false);
        setPhoneMsg('✓ Your phone number is verified successfully!');
      }
    } catch (err) {
      setPhoneError(err.response?.data?.error || 'Invalid or expired OTP code.');
    }
  };

  // Cancel reservation request
  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to request cancellation for this booking?')) return;
    try {
      const res = await api.put(`/bookings/${id}/cancel-request`);
      if (res.data.success) {
        alert('Cancellation request submitted to manager approval.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (!user) return null;

  return (
    <div className="pt-36 px-6 max-w-7xl mx-auto pb-20 min-h-screen bg-slate-950 text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile & Verification card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <User size={32} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{user.name}</h2>
                <span className="text-[10px] bg-slate-950 border border-slate-900 px-3 py-1 rounded-full uppercase font-black text-indigo-400 mt-1 block w-fit">
                  {user.role} account
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-950">
                <Mail size={16} className="text-gray-500" />
                <div>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Email Address</p>
                  <p className="text-white mt-0.5">{user.email}</p>
                </div>
                {user.isEmailVerified ? (
                  <ShieldCheck size={18} className="text-teal-400 ml-auto shrink-0" />
                ) : (
                  <span className="text-[9px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded ml-auto shrink-0 font-bold">Unverified</span>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-950">
                <Phone size={16} className="text-gray-500" />
                <div>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Mobile Number</p>
                  <p className="text-white mt-0.5">{user.phone || 'Not added'}</p>
                </div>
                {user.isPhoneVerified ? (
                  <ShieldCheck size={18} className="text-teal-400 ml-auto shrink-0" />
                ) : (
                  <span className="text-[9px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded ml-auto shrink-0 font-bold">Unverified</span>
                )}
              </div>
            </div>
          </div>

          {/* SMS OTP verification panel */}
          {!user.isPhoneVerified && (
            <div className="glass bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative">
              <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <Phone size={16} className="text-indigo-400" /> Verify Mobile Number
              </h3>

              {phoneMsg && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-2xl mb-4">
                  {phoneMsg}
                </div>
              )}
              {phoneError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl mb-4">
                  {phoneError}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={sendVerificationOtp} className="space-y-4">
                  <p className="text-gray-400 text-[11px] leading-relaxed">Please add your phone number to receive a 6-digit verification code directly inside your backend SMS log console.</p>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                  <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition">
                    Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyVerificationOtp} className="space-y-4">
                  <p className="text-gray-400 text-[11px]">Enter the 6-digit OTP code printed on your backend server terminal:</p>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-center tracking-widest text-white font-bold outline-none focus:border-indigo-500"
                    maxLength={6}
                    required
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setOtpSent(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs">Back</button>
                    <button type="submit" className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs">Confirm OTP</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Bookings History & Cancellation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" /> Reservation History
            </h3>

            {loading ? (
              <p className="text-xs text-gray-500 text-center py-12">Loading your reservations...</p>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking._id} 
                    className="p-5 bg-slate-950/60 border border-slate-900 rounded-3xl flex flex-col sm:flex-row gap-5 relative overflow-hidden"
                  >
                    {/* Visual status indicators on corner */}
                    <div className="absolute top-0 right-0 w-2 h-full bg-slate-800"></div>
                    {booking.status === 'Confirmed' && <div className="absolute top-0 right-0 w-2.5 h-full bg-teal-500"></div>}
                    {booking.status === 'Cancellation Requested' && <div className="absolute top-0 right-0 w-2.5 h-full bg-amber-500 animate-pulse"></div>}
                    {booking.status === 'Cancelled' && <div className="absolute top-0 right-0 w-2.5 h-full bg-rose-600"></div>}

                    {/* Left hotel image thumb */}
                    <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-900">
                      <img src={booking.hotel?.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt="hotel" className="w-full h-full object-cover" />
                    </div>

                    {/* Core details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-sm truncate max-w-xs">{booking.hotel?.name || 'Hotel Property'}</h4>
                          
                          {/* Badges */}
                          {booking.status === 'Confirmed' && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded uppercase">Confirmed</span>
                          )}
                          {booking.status === 'Cancellation Requested' && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">Cancel Claim</span>
                          )}
                          {booking.status === 'Cancelled' && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded uppercase">Cancelled</span>
                          )}
                        </div>

                        <p className="text-[10px] text-gray-500 mb-2">{booking.hotel?.address}, {booking.hotel?.city}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                          <div><span className="text-gray-600 font-semibold uppercase">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString()}</div>
                          <div><span className="text-gray-600 font-semibold uppercase">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                          <div><span className="text-gray-600 font-semibold uppercase">Room Suite:</span> {booking.room?.roomType}</div>
                          <div><span className="text-gray-600 font-semibold uppercase">Guests:</span> {booking.guestsCount?.adults} Adults • {booking.guestsCount?.children} Children</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-slate-900/50 pt-4 mt-3">
                        <div>
                          <span className="text-[9px] text-gray-600 uppercase font-black block">Bill Amount</span>
                          <span className="font-black text-white text-sm">₹{booking.totalAmount}</span>
                        </div>

                        {booking.status === 'Confirmed' && (
                          <button 
                            onClick={() => cancelBooking(booking._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold transition border border-rose-500/20"
                          >
                            <XCircle size={12} /> Claim Cancellation
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}

                {bookings.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-16">You have no reservations booked. Search and discover stays above!</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
