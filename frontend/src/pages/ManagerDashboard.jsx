import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import ManagerSidebar from '../components/ManagerSidebar';
import ManagerTopBar from '../components/ManagerTopBar';
import ManagerBookings from './ManagerBookings';
import ManagerGuests from './ManagerGuests';
import ManagerRooms from './ManagerRooms';

export default function ManagerDashboard() {
  const { user, token } = useContext(AuthContext);

  // Lists
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'dashboard', 'bookings', 'rooms', 'guests', 'housekeeping', 'reports', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

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
      const hotelsRes = await api.get('/hotels/manager/all');
      if (hotelsRes.data.success) {
        setHotels(hotelsRes.data.data);
      }

      const bookingsRes = await api.get('/bookings/manager');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

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

  // Submit Handlers
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const imagesArr = hotelForm.imagesInput.split('\n').filter(url => url.trim().length > 0);
      const res = await api.post('/hotels', {
        ...hotelForm,
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
        amenities: hotelForm.amenities.split(',').map(a => a.trim()),
        status: 'Pending Approval'
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

  // Helper
  const getTitle = () => {
    switch (activeTab) {
      case 'bookings': return 'Bookings Management';
      case 'rooms': return 'Room Inventory';
      case 'guests': return 'Guest Directory';
      case 'settings': return 'Hotel Settings';
      case 'dashboard':
      default: return 'Dashboard Overview';
    }
  };

  // Stats
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + b.totalAmount : sum, 0);
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex">
      <ManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64 relative">
        <ManagerTopBar 
          title={getTitle()} 
          showAddButton={activeTab === 'rooms' || activeTab === 'dashboard'} 
          onAddAction={() => activeTab === 'rooms' ? setShowAddRoomModal(true) : setShowAddHotelModal(true)} 
        />
        
        <main className="pt-24 px-10 pb-10 h-screen overflow-y-auto custom-scrollbar">
          
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center bg-surface-container-lowest rounded-2xl p-6 border border-platinum-gray/30 card-shadow">
                <div>
                  <h3 className="font-headline-md text-headline-md text-heritage-navy">Welcome back, {user?.name || 'Manager'}</h3>
                  <p className="font-body-md text-on-surface-variant mt-1">Here is what's happening with your properties today.</p>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-label-md text-steward-gold uppercase tracking-widest">Payout Balance</p>
                  <h2 className="font-display-lg text-display-lg text-heritage-navy mt-1">₹{(totalRevenue * 0.9).toLocaleString()}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <div key={hotel._id} className="bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 overflow-hidden card-shadow">
                    <div className="h-32 bg-slate-200 relative">
                      <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt="hotel" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <h4 className="font-title-lg text-title-lg text-white">{hotel.name}</h4>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase mt-1 inline-block ${
                          hotel.status === 'Live' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {hotel.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 border-t border-platinum-gray/30">
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Rooms</p>
                        <p className="font-title-lg text-title-lg text-heritage-navy">{hotel.rooms?.length || 0}</p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Bookings</p>
                        <p className="font-title-lg text-title-lg text-heritage-navy">{bookings.filter(b => b.hotel?._id === hotel._id).length}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {hotels.length === 0 && (
                  <div className="col-span-3 text-center py-16 bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 border-dashed">
                    <p className="font-label-md text-label-md text-on-surface-variant">No properties found. Add a hotel to start.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && <ManagerBookings bookings={bookings} />}
          {activeTab === 'guests' && <ManagerGuests bookings={bookings} />}
          {activeTab === 'rooms' && (
            <ManagerRooms 
              hotels={hotels} 
              roomForm={roomForm} 
              setRoomForm={setRoomForm} 
              setShowAddRoomModal={setShowAddRoomModal} 
            />
          )}

          {/* Fallback for un-implemented tabs */}
          {['housekeeping', 'reports', 'settings'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 card-shadow text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-50 mb-4">construction</span>
              <h3 className="font-title-lg text-title-lg text-heritage-navy">Under Construction</h3>
              <p className="font-body-md mt-2">The {activeTab} view is coming soon.</p>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {showAddHotelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddHotelModal(false)} className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-heritage-navy bg-surface-container rounded-full transition"><span className="material-symbols-outlined text-[16px]">close</span></button>
            <h3 className="font-headline-md text-headline-md text-heritage-navy mb-6">List New Property</h3>
            <form onSubmit={handleCreateHotel} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Hotel Name</label>
                   <input type="text" value={hotelForm.name} onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})} className="w-full bg-surface-container-low border border-platinum-gray rounded-xl p-3 text-heritage-navy outline-none focus:border-steward-gold" required />
                 </div>
                 <div>
                   <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Starting Price (₹ / night)</label>
                   <input type="number" value={hotelForm.startingPrice} onChange={(e) => setHotelForm({...hotelForm, startingPrice: Number(e.target.value)})} className="w-full bg-surface-container-low border border-platinum-gray rounded-xl p-3 text-heritage-navy outline-none focus:border-steward-gold" required />
                 </div>
               </div>
               <div>
                 <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Description</label>
                 <textarea value={hotelForm.description} onChange={(e) => setHotelForm({...hotelForm, description: e.target.value})} className="w-full bg-surface-container-low border border-platinum-gray rounded-xl p-3 text-heritage-navy outline-none focus:border-steward-gold h-20 resize-none" required></textarea>
               </div>
               <div className="grid grid-cols-3 gap-4">
                 <div><label className="font-label-md block mb-1">City</label><input type="text" value={hotelForm.city} onChange={e=>setHotelForm({...hotelForm, city: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-2 outline-none" required /></div>
                 <div><label className="font-label-md block mb-1">State</label><input type="text" value={hotelForm.state} onChange={e=>setHotelForm({...hotelForm, state: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-2 outline-none" required /></div>
                 <div><label className="font-label-md block mb-1">Pincode</label><input type="text" value={hotelForm.pincode} onChange={e=>setHotelForm({...hotelForm, pincode: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-2 outline-none" required /></div>
               </div>
               <div>
                 <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Address</label>
                 <input type="text" value={hotelForm.address} onChange={(e) => setHotelForm({...hotelForm, address: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none focus:border-steward-gold" required />
               </div>
               <div>
                 <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Image URLs</label>
                 <textarea value={hotelForm.imagesInput} onChange={(e) => setHotelForm({...hotelForm, imagesInput: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none focus:border-steward-gold h-20 resize-none" required></textarea>
               </div>
               <button type="submit" className="w-full py-4 bg-heritage-navy text-linen-white font-label-md rounded-xl hover:bg-opacity-90 transition mt-6 shadow-lg">Submit Property</button>
            </form>
          </div>
        </div>
      )}

      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddRoomModal(false)} className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-heritage-navy bg-surface-container rounded-full transition"><span className="material-symbols-outlined text-[16px]">close</span></button>
            <h3 className="font-headline-md text-headline-md text-heritage-navy mb-6">Add Room Inventory</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
               <div>
                 <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Select Hotel</label>
                 <select value={roomForm.hotelId} onChange={(e) => setRoomForm({...roomForm, hotelId: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none" required>
                   <option value="">Select hotel...</option>
                   {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="font-label-md block mb-1">Room Class</label><input type="text" value={roomForm.roomType} onChange={e=>setRoomForm({...roomForm, roomType: e.target.value})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none" required /></div>
                 <div><label className="font-label-md block mb-1">Base Price</label><input type="number" value={roomForm.price} onChange={e=>setRoomForm({...roomForm, price: Number(e.target.value)})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none" required /></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="font-label-md block mb-1">Max Guests</label><input type="number" value={roomForm.maxGuests} onChange={e=>setRoomForm({...roomForm, maxGuests: Number(e.target.value)})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none" required /></div>
                 <div><label className="font-label-md block mb-1">AC Option</label>
                   <select value={roomForm.isAC} onChange={e=>setRoomForm({...roomForm, isAC: e.target.value === 'true'})} className="w-full bg-surface border border-platinum-gray rounded-xl p-3 outline-none">
                     <option value="true">AC</option>
                     <option value="false">Non-AC</option>
                   </select>
                 </div>
               </div>
               <button type="submit" className="w-full py-4 bg-steward-gold text-white font-label-md rounded-xl hover:bg-opacity-90 transition mt-6 shadow-lg">List Room</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
