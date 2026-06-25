import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Hotel, BedDouble, Tag, CalendarRange, Plus, Check, X, ShieldAlert, Award, Star, Settings, ChevronRight, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ManagerDashboard() {
  const { user, token } = useContext(AuthContext);

  // Lists
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Onboarding tour state
  const [showTour, setShowTour] = useState(true);

  // Tabs: 'properties', 'rooms', 'bookings', 'coupons'
  const [activeTab, setActiveTab] = useState('properties');

  // Modals
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // Add Hotel Form State
  const [hotelForm, setHotelForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    hotelType: 'Luxury',
    amenities: 'Free WiFi, AC, Parking, Room Service',
    rulesAndPolicies: 'Valid ID required, Couples-friendly',
    imagesInput: '',
    startingPrice: 1500,
    couplesFriendly: true
  });

  // Add Room Form State
  const [roomForm, setRoomForm] = useState({
    hotelId: '',
    roomType: 'Deluxe',
    isAC: true,
    price: 2000,
    discount: 0,
    roomSize: '250 sq.ft.',
    maxGuests: 2,
    bedType: 'Double',
    amenities: 'TV, Attached Bathroom, Tea maker',
    availableRooms: 5
  });

  // Add Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 10,
    validTo: ''
  });

  const loadManagerData = async () => {
    setLoading(true);
    try {
      // 1. Load Hotels
      const hotelsRes = await api.get('/hotels/manager/all');
      if (hotelsRes.data.success) {
        setHotels(hotelsRes.data.data);
      }

      // 2. Load Bookings
      const bookingsRes = await api.get('/bookings/manager');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      // 3. Load Coupons
      const offersRes = await api.get('/offers/my');
      if (offersRes.data.success) {
        setOffers(offersRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadManagerData();
    }
  }, [token]);

  // Submit Hotel
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      // split images
      const imagesArr = hotelForm.imagesInput.split('\n').filter(url => url.trim().length > 0);
      
      const res = await api.post('/hotels', {
        ...hotelForm,
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
        amenities: hotelForm.amenities.split(',').map(a => a.trim()),
        status: 'Pending Approval' // auto trigger review queue
      });

      if (res.data.success) {
        setShowAddHotelModal(false);
        loadManagerData();
        alert('Hotel registration submitted successfully for verification!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit hotel');
    }
  };

  // Submit Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', {
        ...roomForm,
        amenities: roomForm.amenities.split(',').map(a => a.trim())
      });

      if (res.data.success) {
        setShowAddRoomModal(false);
        loadManagerData();
        alert('Room type listed successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to list room');
    }
  };

  // Submit Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/offers', couponForm);
      if (res.data.success) {
        setShowAddCouponModal(false);
        loadManagerData();
        alert('Coupon discount code activated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create discount');
    }
  };

  // Handle booking cancellation requests
  const handleCancellationRequest = async (id, action) => {
    try {
      const res = await api.put(`/bookings/${id}/cancel-handle`, { action });
      if (res.data.success) {
        alert(`Cancellation request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
        loadManagerData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  // Toggle AC dynamic price increment directly
  const handleACPriceToggle = async (roomId, currentIsAC, price) => {
    try {
      const newPrice = currentIsAC ? price - 500 : price + 500; // auto adjust 500 Rs for AC usage
      const res = await api.put(`/rooms/${roomId}`, {
        isAC: !currentIsAC,
        price: newPrice
      });
      if (res.data.success) {
        loadManagerData();
      }
    } catch (err) {
      alert('AC Price update failed');
    }
  };

  // Calculate stats
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + b.totalAmount : sum, 0);
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <div className="pt-36 px-6 max-w-7xl mx-auto pb-20 min-h-screen bg-slate-950 text-slate-100">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Manager Console</h1>
          <p className="text-gray-400 text-xs">Manage inventory, discount codes, occupancy lists, and payouts.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddHotelModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <Plus size={14} /> Add Hotel Property
          </button>
          {hotels.length > 0 && (
            <button 
              onClick={() => { setRoomForm({ ...roomForm, hotelId: hotels[0]._id }); setShowAddRoomModal(true); }}
              className="px-5 py-3 bg-slate-900 border border-slate-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
            >
              <Plus size={14} /> Add Room Suite
            </button>
          )}
        </div>
      </div>

      {/* Guided Onboarding Helper banner */}
      {showTour && hotels.length === 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-2 border-indigo-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -z-10"></div>
          <div>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit mb-3">Onboarding Step-by-Step Guide</span>
            <h2 className="text-xl font-black text-white mb-2">Welcome to your Manager Dashboard!</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xl">To start earning and welcoming travelers, please check off these initial setup milestones:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">1</span> Register your Hotel Property</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">2</span> Upload 15+ photos with previews</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</span> Configure Room Pricing & AC pricing</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">4</span> Deploy discount coupon codes</div>
            </div>
          </div>
          <button 
            onClick={() => setShowTour(false)} 
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl font-bold text-xs shrink-0 transition"
          >
            Got it, Let's go!
          </button>
        </div>
      )}

      {/* Stats Console Card row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass bg-slate-900 border border-slate-850 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-wider">Manager Payout Balance</p>
            <h3 className="text-2xl font-black text-white mt-1">₹{(totalRevenue * 0.9).toLocaleString()}</h3>
            <span className="text-[9px] text-gray-500 mt-1 block">Excluding 10% platform fee</span>
          </div>
        </div>

        <div className="glass bg-slate-900 border border-slate-850 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <CalendarRange size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-wider">Active Occupancy bookings</p>
            <h3 className="text-2xl font-black text-white mt-1">{activeBookings}</h3>
            <span className="text-[9px] text-gray-500 mt-1 block">Guests check-in confirmed</span>
          </div>
        </div>

        <div className="glass bg-slate-900 border border-slate-850 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-pink-500/10 text-pink-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-wider">Verification Score</p>
            <h3 className="text-2xl font-black text-white mt-1">98%</h3>
            <span className="text-[9px] text-gray-500 mt-1 block">Perfect profile check badge</span>
          </div>
        </div>
      </div>

      {/* Main Tabs verification */}
      <div className="glass bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-900 mb-6 pb-2">
          {[
            { id: 'properties', label: 'My Properties', icon: Hotel },
            { id: 'bookings', label: 'Occupancy Bookings', icon: CalendarRange },
            { id: 'coupons', label: 'Discount Coupons', icon: Tag }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-indigo-400 border-b-2 border-indigo-400' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Properties manager list */}
        {activeTab === 'properties' && (
          <div className="space-y-6 text-xs">
            {hotels.map((hotel) => (
              <div 
                key={hotel._id} 
                className="p-5 bg-slate-950/60 border border-slate-900 rounded-3xl flex flex-col md:flex-row gap-6 hover:border-slate-850 transition"
              >
                {/* Thumb */}
                <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-900">
                  <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt="hotel" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-lg font-black text-white">{hotel.name}</h4>
                        <p className="text-gray-500 text-[10px] mt-0.5">{hotel.address}, {hotel.city}</p>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        hotel.status === 'Live' ? 'bg-teal-500/10 text-teal-400' :
                        hotel.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400 animate-pulse'
                      }`}>
                        {hotel.status}
                      </span>
                    </div>

                    {/* Room pricing details list */}
                    <div className="mt-4 border-t border-slate-900/50 pt-3">
                      <h5 className="font-black text-gray-500 text-[9px] uppercase tracking-wider mb-2">Room Pricing Control & AC Toggle</h5>
                      <div className="space-y-2">
                        {hotel.rooms?.map((room) => (
                          <div key={room._id} className="p-3 bg-slate-950 border border-slate-900/40 rounded-xl flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-bold text-white">{room.roomType} Suite • {room.bedType}</p>
                              <p className="text-gray-500 text-[9px] mt-0.5">{room.roomSize} • Max {room.maxGuests} guests</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {/* AC Pricing control toggle */}
                              <button 
                                onClick={() => handleACPriceToggle(room._id, room.isAC, room.price)}
                                className={`px-2.5 py-1 rounded-lg border font-black transition uppercase text-[8px] ${
                                  room.isAC 
                                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                                    : 'bg-slate-900 text-gray-500 border-slate-800'
                                }`}
                              >
                                {room.isAC ? '✓ AC ON (Premium)' : 'Non-AC (+500 Rs)'}
                              </button>
                              
                              <span className="font-black text-white text-xs">₹{room.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <button 
                      onClick={() => { setRoomForm({ ...roomForm, hotelId: hotel._id }); setShowAddRoomModal(true); }}
                      className="px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-gray-300 hover:text-white transition"
                    >
                      + Add New Room Type
                    </button>
                  </div>
                </div>

              </div>
            ))}
            
            {hotels.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Hotel className="mx-auto text-slate-800 mb-2" size={32} />
                <p>No property listings added. Click "Add Hotel Property" above to list your stays!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Occupancy bookings with cancellation claims */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-gray-500 font-bold">
                  <th className="pb-3 font-bold uppercase tracking-wider">Guest Details</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Check-In / Out</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Hotel Property</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Revenue</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-900/40 hover:bg-slate-950/20 transition">
                    <td className="py-4 font-bold text-white">
                      <p>{booking.user?.name}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{booking.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-gray-300">
                      <p>{new Date(booking.checkInDate).toLocaleDateString()} check-in</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{new Date(booking.checkOutDate).toLocaleDateString()} check-out</p>
                    </td>
                    <td className="py-4 text-gray-400">
                      <p className="font-bold">{booking.hotel?.name}</p>
                      <span className="text-[9px] text-gray-600">{booking.room?.roomType} room</span>
                    </td>
                    <td className="py-4 font-bold text-white">₹{booking.totalAmount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        booking.status === 'Confirmed' ? 'bg-teal-500/10 text-teal-400' :
                        booking.status === 'Cancellation Requested' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {booking.status === 'Cancellation Requested' && (
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => handleCancellationRequest(booking._id, 'approve')}
                            className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/20"
                            title="Approve Cancellation Claim"
                          >
                            <Check size={12} />
                          </button>
                          <button 
                            onClick={() => handleCancellationRequest(booking._id, 'decline')}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20"
                            title="Decline Cancellation Claim"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">No reservations booked yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Discount coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-white text-sm">Active Discount Promo codes</h4>
              <button 
                onClick={() => setShowAddCouponModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 rounded-xl font-bold"
              >
                + Create Promo Code
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer._id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-black tracking-widest text-xs uppercase">{offer.code}</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{offer.discountPercent}% OFF</span>
                  </div>

                  <p className="text-gray-500 text-[10px]">Valid Until: {new Date(offer.validTo).toLocaleDateString()}</p>
                </div>
              ))}
              {offers.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <Tag className="mx-auto text-slate-800 mb-2" size={32} />
                  <p>No active coupons listed. Deploy promo codes to claim visibility boosts!</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD HOTEL PROPERTY */}
      {showAddHotelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="glass bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddHotelModal(false)} className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-850 text-gray-500 hover:text-white rounded-xl transition"><X size={16} /></button>
            
            <h3 className="text-xl font-black text-white mb-6">List New Property</h3>
            
            <form onSubmit={handleCreateHotel} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Hotel Name</label>
                  <input type="text" value={hotelForm.name} onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Starting Price (₹ / night)</label>
                  <input type="number" value={hotelForm.startingPrice} onChange={(e) => setHotelForm({...hotelForm, startingPrice: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none focus:border-indigo-500" required />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Property Description</label>
                <textarea value={hotelForm.description} onChange={(e) => setHotelForm({...hotelForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none focus:border-indigo-500 h-20 resize-none animate-none" required></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">City</label>
                  <input type="text" value={hotelForm.city} onChange={(e) => setHotelForm({...hotelForm, city: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">State</label>
                  <input type="text" value={hotelForm.state} onChange={(e) => setHotelForm({...hotelForm, state: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Pincode</label>
                  <input type="text" value={hotelForm.pincode} onChange={(e) => setHotelForm({...hotelForm, pincode: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Physical Address</label>
                <input type="text" value={hotelForm.address} onChange={(e) => setHotelForm({...hotelForm, address: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Catalog Category</label>
                  <select value={hotelForm.hotelType} onChange={(e) => setHotelForm({...hotelForm, hotelType: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white cursor-pointer outline-none">
                    {['Luxury', 'Budget', 'Resort', 'Villa', 'Boutique', 'Business'].map(t => <option key={t} value={t} className="bg-slate-950">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Amenities (Comma separated)</label>
                  <input type="text" value={hotelForm.amenities} onChange={(e) => setHotelForm({...hotelForm, amenities: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Image URLs (At least 15 images recommended, enter one URL per line)</label>
                <textarea 
                  value={hotelForm.imagesInput} 
                  onChange={(e) => setHotelForm({...hotelForm, imagesInput: e.target.value})} 
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none focus:border-indigo-500 h-24 resize-none font-mono"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-95 transition mt-6 text-xs"
              >
                Submit Property for verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ROOM TYPE */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="glass bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setShowAddRoomModal(false)} className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-850 text-gray-500 hover:text-white rounded-xl transition"><X size={16} /></button>
            
            <h3 className="text-xl font-black text-white mb-6">Add Room Inventory</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs text-left">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Select Hotel Property</label>
                <select 
                  value={roomForm.hotelId} 
                  onChange={(e) => setRoomForm({...roomForm, hotelId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white cursor-pointer outline-none"
                  required
                >
                  <option value="" className="bg-slate-950">Select hotel...</option>
                  {hotels.map(h => <option key={h._id} value={h._id} className="bg-slate-950">{h.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Room Class / Suite</label>
                  <input type="text" value={roomForm.roomType} onChange={(e) => setRoomForm({...roomForm, roomType: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Base Price (₹ / night)</label>
                  <input type="number" value={roomForm.price} onChange={(e) => setRoomForm({...roomForm, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Max Guests</label>
                  <input type="number" value={roomForm.maxGuests} onChange={(e) => setRoomForm({...roomForm, maxGuests: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Suite Size</label>
                  <input type="text" value={roomForm.roomSize} onChange={(e) => setRoomForm({...roomForm, roomSize: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">AC Option</label>
                  <select 
                    value={roomForm.isAC} 
                    onChange={(e) => setRoomForm({...roomForm, isAC: e.target.value === 'true'})}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white cursor-pointer outline-none"
                  >
                    <option value="true" className="bg-slate-950">Air Conditioned</option>
                    <option value="false" className="bg-slate-950">Non-AC</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-95 transition mt-6 text-xs"
              >
                List Room Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE COUPON */}
      {showAddCouponModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="glass bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={() => setShowAddCouponModal(false)} className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-850 text-gray-500 hover:text-white rounded-xl transition"><X size={16} /></button>
            
            <h3 className="text-xl font-black text-white mb-6">Create Promo Code</h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs text-left">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Coupon Code (Uppercase)</label>
                <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none tracking-widest font-black" placeholder="e.g. SUMMER20" required />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Discount Percent (%)</label>
                <input type="number" min="1" max="90" value={couponForm.discountPercent} onChange={(e) => setCouponForm({...couponForm, discountPercent: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none" required />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Expiry Date</label>
                <input type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({...couponForm, validTo: e.target.value})} className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white outline-none cursor-pointer" required />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-95 transition mt-6 text-xs"
              >
                Activate coupon Code
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
