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
    <div className="pt-36 px-6 max-w-7xl mx-auto pb-20 min-h-screen bg-surface text-on-surface font-body-md">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile & Verification card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl relative overflow-hidden card-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-steward-gold"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-surface-container border border-platinum-gray/50 flex items-center justify-center">
                <User size={32} className="text-heritage-navy" />
              </div>
              <div>
                <h2 className="text-xl font-headline-md font-black text-heritage-navy">{user.name}</h2>
                <span className="font-label-sm text-[10px] bg-surface-bright border border-platinum-gray/50 px-3 py-1 rounded-full uppercase font-black text-steward-gold mt-1 block w-fit shadow-sm">
                  {user.role} account
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-body-sm">
              <div className="flex items-center gap-3 p-3 bg-surface-bright rounded-2xl border border-platinum-gray/30 shadow-sm">
                <Mail size={16} className="text-on-surface-variant" />
                <div>
                  <p className="font-label-sm text-[9px] text-on-surface-variant font-bold uppercase">Email Address</p>
                  <p className="text-heritage-navy font-semibold mt-0.5">{user.email}</p>
                </div>
                {user.isEmailVerified ? (
                  <ShieldCheck size={18} className="text-emerald-600 ml-auto shrink-0" />
                ) : (
                  <span className="font-label-sm text-[9px] text-error bg-error/10 px-2 py-0.5 rounded ml-auto shrink-0 font-bold border border-error/20">Unverified</span>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-bright rounded-2xl border border-platinum-gray/30 shadow-sm">
                <Phone size={16} className="text-on-surface-variant" />
                <div>
                  <p className="font-label-sm text-[9px] text-on-surface-variant font-bold uppercase">Mobile Number</p>
                  <p className="text-heritage-navy font-semibold mt-0.5">{user.phone || 'Not added'}</p>
                </div>
                {user.isPhoneVerified ? (
                  <ShieldCheck size={18} className="text-emerald-600 ml-auto shrink-0" />
                ) : (
                  <span className="font-label-sm text-[9px] text-error bg-error/10 px-2 py-0.5 rounded ml-auto shrink-0 font-bold border border-error/20">Unverified</span>
                )}
              </div>
            </div>
          </div>

          {/* SMS OTP verification panel */}
          {!user.isPhoneVerified && (
            <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl shadow-lg relative">
              <h3 className="font-title-md text-sm font-black text-heritage-navy mb-4 flex items-center gap-2">
                <Phone size={16} className="text-steward-gold" /> Verify Mobile Number
              </h3>

              {phoneMsg && (
                <div className="p-3 bg-emerald-600/10 border border-emerald-600/20 text-emerald-600 font-body-sm text-xs rounded-2xl mb-4 shadow-sm">
                  {phoneMsg}
                </div>
              )}
              {phoneError && (
                <div className="p-3 bg-error/10 border border-error/20 text-error font-body-sm text-xs rounded-2xl mb-4 shadow-sm">
                  {phoneError}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={sendVerificationOtp} className="space-y-4 font-body-sm">
                  <p className="text-on-surface-variant text-[11px] leading-relaxed">Please add your phone number to receive a 6-digit verification code directly inside your backend SMS log console.</p>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-bright border border-platinum-gray/50 rounded-xl p-3 text-xs text-heritage-navy outline-none focus:border-steward-gold font-semibold"
                    required
                  />
                  <button type="submit" className="w-full py-3 bg-steward-gold hover:bg-opacity-90 text-white rounded-xl font-bold font-label-md text-xs transition shadow-md">
                    Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyVerificationOtp} className="space-y-4 font-body-sm">
                  <p className="text-on-surface-variant text-[11px]">Enter the 6-digit OTP code printed on your backend server terminal:</p>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-surface-bright border border-platinum-gray/50 rounded-xl p-3 text-center tracking-widest text-heritage-navy font-bold outline-none focus:border-steward-gold text-lg"
                    maxLength={6}
                    required
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setOtpSent(false)} className="flex-1 py-3 bg-surface-container border border-platinum-gray text-heritage-navy rounded-xl font-bold font-label-md text-xs hover:bg-surface-container-high transition">Back</button>
                    <button type="submit" className="flex-1 py-3 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl font-bold font-label-md text-xs transition shadow-md">Confirm OTP</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Bookings History & Cancellation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
            <h3 className="font-headline-sm text-xl font-black text-heritage-navy mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-steward-gold" /> Reservation History
            </h3>

            {loading ? (
              <p className="text-xs font-body-sm text-on-surface-variant text-center py-12">Loading your reservations...</p>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking._id} 
                    className="p-5 bg-surface-bright border border-platinum-gray/30 rounded-3xl flex flex-col sm:flex-row gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Visual status indicators on corner */}
                    <div className="absolute top-0 right-0 w-2 h-full bg-platinum-gray/50"></div>
                    {booking.status === 'Confirmed' && <div className="absolute top-0 right-0 w-2.5 h-full bg-emerald-500"></div>}
                    {booking.status === 'Cancellation Requested' && <div className="absolute top-0 right-0 w-2.5 h-full bg-amber-500 animate-pulse"></div>}
                    {booking.status === 'Cancelled' && <div className="absolute top-0 right-0 w-2.5 h-full bg-error"></div>}

                    {/* Left hotel image thumb */}
                    <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden shrink-0 bg-surface-container border border-platinum-gray/30">
                      <img src={booking.hotel?.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt="hotel" className="w-full h-full object-cover" />
                    </div>

                    {/* Core details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold font-title-md text-heritage-navy text-sm truncate max-w-xs">{booking.hotel?.name || 'Hotel Property'}</h4>
                          
                          {/* Badges */}
                          {booking.status === 'Confirmed' && (
                            <span className="flex items-center gap-1 font-label-sm text-[9px] font-black text-emerald-600 bg-emerald-600/10 border border-emerald-600/20 px-2 py-0.5 rounded uppercase shadow-sm">Confirmed</span>
                          )}
                          {booking.status === 'Cancellation Requested' && (
                            <span className="flex items-center gap-1 font-label-sm text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase shadow-sm">Cancel Claim</span>
                          )}
                          {booking.status === 'Cancelled' && (
                            <span className="flex items-center gap-1 font-label-sm text-[9px] font-black text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded uppercase shadow-sm">Cancelled</span>
                          )}
                        </div>

                        <p className="font-body-sm text-[10px] text-on-surface-variant mb-2">{booking.hotel?.address}, {booking.hotel?.city}</p>
                        
                        <div className="grid grid-cols-2 gap-2 font-body-sm text-[10px] text-heritage-navy">
                          <div><span className="text-on-surface-variant font-semibold uppercase font-label-sm">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString()}</div>
                          <div><span className="text-on-surface-variant font-semibold uppercase font-label-sm">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                          <div><span className="text-on-surface-variant font-semibold uppercase font-label-sm">Room Suite:</span> {booking.room?.roomType}</div>
                          <div><span className="text-on-surface-variant font-semibold uppercase font-label-sm">Guests:</span> {booking.guestsCount?.adults} Adults • {booking.guestsCount?.children} Children</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-platinum-gray/30 pt-4 mt-3">
                        <div>
                          <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-black block">Bill Amount</span>
                          <span className="font-black font-display-sm text-heritage-navy text-sm">₹{booking.totalAmount}</span>
                        </div>

                        {booking.status === 'Confirmed' && (
                          <button 
                            onClick={() => cancelBooking(booking._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-xl font-label-md text-[10px] font-bold transition border border-error/20 shadow-sm"
                          >
                            <XCircle size={12} /> Claim Cancellation
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}

                {bookings.length === 0 && (
                  <p className="font-body-sm text-xs text-on-surface-variant text-center py-16 bg-surface-bright rounded-2xl border border-dashed border-platinum-gray/50">You have no reservations booked. Search and discover stays above!</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
