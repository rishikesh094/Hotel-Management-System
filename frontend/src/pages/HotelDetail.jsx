import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Star, MapPin, CheckCircle, ShieldCheck, Heart, User, Send, BedDouble, Calendar } from 'lucide-react';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Dates
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hotels/${id}`);
      if (res.data.success) {
        setHotel(res.data.data);
        if (res.data.data.rooms?.length > 0) {
          setSelectedRoom(res.data.data.rooms[0]);
        }
      }
      
      const reviewsRes = await api.get(`/reviews/hotel/${id}`);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedRoom) {
      setErrorMsg('Please select a room type');
      return;
    }

    try {
      const res = await api.post('/bookings', {
        hotelId: hotel._id,
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
        guestsCount: { adults, children },
        paymentMethod: 'Pay at Hotel'
      });

      if (res.data.success) {
        setBookingSuccess(true);
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Booking checkout failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/reviews', {
        hotelId: hotel._id,
        rating: newRating,
        comment: newComment
      });

      if (res.data.success) {
        setNewComment('');
        fetchHotelDetails(); // reload details and reviews
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-steward-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-heritage-navy">
        <p className="font-body-md">Property listing not found.</p>
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 max-w-7xl mx-auto pb-16 bg-surface text-on-surface min-h-screen font-body-md">
      
      {/* Title block */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck size={12} /> StayBadge Verified
            </span>
            {hotel.couplesFriendly && (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-error/10 text-error border border-error/20 px-3 py-1 rounded-full shadow-sm">
                <Heart size={12} /> Couples Friendly
              </span>
            )}
          </div>
          <h1 className="text-3xl font-headline-lg font-black text-heritage-navy">{hotel.name}</h1>
          <p className="flex items-center gap-1 text-sm font-body-sm text-on-surface-variant mt-2">
            <MapPin size={14} className="text-steward-gold" /> {hotel.address}, {hotel.city}, {hotel.state}, {hotel.pincode}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-black block">Rating Score</span>
            <div className="flex items-center gap-1 text-xl font-black text-heritage-navy mt-1">
              <Star className="text-steward-gold" size={20} fill="currentColor" /> {hotel.rating}
              <span className="text-xs font-body-sm text-on-surface-variant font-normal">({hotel.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 15-Image Gallery Grid (Responsive Carousel Feel) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Main large image */}
        <div className="col-span-2 row-span-2 h-96 rounded-3xl overflow-hidden bg-surface-container border border-platinum-gray/50 card-shadow">
          <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd'} alt="Main view" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
        </div>
        
        {/* Secondary grid elements */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const imgUrl = hotel.images[idx + 1] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
          return (
            <div key={idx} className="h-44 rounded-2xl overflow-hidden bg-surface-container border border-platinum-gray/50">
              <img src={imgUrl} alt={`Hotel Grid ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
            </div>
          );
        })}

        {/* Small thumbnail links overlay to demonstrate 15+ images */}
        <div className="col-span-4 flex gap-2 overflow-x-auto py-2 custom-scrollbar">
          {Array.from({ length: 15 }).map((_, index) => {
            const mockUrl = hotel.images[index % hotel.images.length] || 'https://images.unsplash.com/photo-1542314831-c53cd381612a';
            return (
              <div key={index} className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-platinum-gray/50 hover:border-steward-gold transition cursor-pointer">
                <img src={mockUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            );
          })}
          <div className="px-3 bg-surface-bright border border-platinum-gray/50 rounded-lg flex items-center justify-center shrink-0 font-label-sm text-[10px] text-on-surface-variant font-bold uppercase shadow-sm">
            +15 photos
          </div>
        </div>
      </div>

      {/* Main details body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
            <h3 className="text-xl font-title-lg font-bold text-heritage-navy mb-4">Property Description</h3>
            <p className="text-on-surface-variant font-body-sm text-sm leading-relaxed">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
            <h3 className="text-xl font-title-lg font-bold text-heritage-navy mb-4">Amenities Offered</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 font-body-sm text-xs text-on-surface-variant">
                  <CheckCircle size={14} className="text-steward-gold" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room options picker */}
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
            <h3 className="text-xl font-title-lg font-bold text-heritage-navy mb-4">Select Room Type</h3>
            <div className="space-y-4">
              {hotel.rooms?.map((room) => (
                <div 
                  key={room._id} 
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
                    selectedRoom?._id === room._id 
                      ? 'bg-steward-gold/5 border-steward-gold shadow-md' 
                      : 'bg-surface-bright border-platinum-gray/30 hover:border-steward-gold/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-platinum-gray/30">
                      <BedDouble size={20} className={selectedRoom?._id === room._id ? 'text-steward-gold' : 'text-on-surface-variant'} />
                    </div>
                    <div>
                      <h4 className="font-bold font-title-md text-heritage-navy text-sm">{room.roomType} Suite</h4>
                      <p className="font-label-sm text-[10px] text-on-surface-variant mt-1">{room.roomSize} • {room.maxGuests} guests max • {room.isAC ? 'AC Room' : 'Non-AC'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-black font-display-sm text-heritage-navy">₹{room.price}</p>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">per night</span>
                  </div>
                </div>
              ))}
              {(!hotel.rooms || hotel.rooms.length === 0) && (
                <p className="font-body-sm text-xs text-on-surface-variant text-center py-4">No rooms listed for this hotel yet.</p>
              )}
            </div>
          </div>

          {/* Reviews list */}
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
            <h3 className="text-xl font-title-lg font-bold text-heritage-navy mb-6">Guest Reviews</h3>

            {/* Submit review */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-surface-bright border border-platinum-gray/50 rounded-2xl shadow-sm">
                <h4 className="font-label-sm text-xs font-bold text-heritage-navy uppercase tracking-wider mb-3">Add Your Review</h4>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-steward-gold"
                    >
                      <Star size={16} fill={newRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3 items-center">
                  <input 
                    type="text" 
                    placeholder="Tell us about your stay..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-surface border border-platinum-gray/50 rounded-xl p-3 font-body-sm text-xs text-heritage-navy outline-none focus:border-steward-gold"
                    required
                  />
                  <button type="submit" className="p-3 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl transition shadow-md">
                    <Send size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <p className="font-body-sm text-xs text-on-surface-variant mb-6">Please log in to leave a review.</p>
            )}

            {/* Reviews queue */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-surface-bright border border-platinum-gray/50 rounded-2xl font-body-sm text-xs shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container border border-platinum-gray/30 flex items-center justify-center">
                        <User size={12} className="text-heritage-navy" />
                      </div>
                      <span className="font-bold text-heritage-navy">{rev.user?.name || 'Guest'}</span>
                    </div>
                    <span className="text-steward-gold font-bold">{rev.rating}★</span>
                  </div>
                  
                  <p className="text-on-surface-variant leading-relaxed pl-8 mb-3">{rev.comment}</p>

                  {/* Manager Reply display */}
                  {rev.reply && (
                    <div className="ml-8 mt-2 p-3 bg-primary-fixed/30 border-l-2 border-primary rounded-r-xl">
                      <p className="font-label-sm font-black text-heritage-navy text-[10px] uppercase tracking-wider mb-1">Hotel Manager Response</p>
                      <p className="text-on-surface-variant italic">"{rev.reply}"</p>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="font-body-sm text-xs text-on-surface-variant text-center py-4">No reviews yet. Be the first to add one!</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Checkout widget column */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl sticky top-28 shadow-2xl card-shadow">
            {bookingSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-emerald-600 mb-4" size={48} />
                <h4 className="text-lg font-title-lg font-bold text-heritage-navy mb-2">Booking Confirmed!</h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mb-6">Your check-in has been successfully registered. You can pay directly at the hotel desk upon arrival.</p>
                <button 
                  onClick={() => navigate('/profile')} 
                  className="w-full py-3 bg-steward-gold text-white rounded-2xl hover:bg-opacity-90 font-bold font-label-md text-xs transition shadow-lg"
                >
                  View Bookings
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <h3 className="text-lg font-title-lg font-black text-heritage-navy mb-4">Book Your Stay</h3>
                
                {errorMsg && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error font-body-sm text-xs rounded-xl shadow-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Selected room info */}
                {selectedRoom && (
                  <div className="p-3 bg-surface-bright border border-platinum-gray/50 rounded-2xl flex justify-between items-center font-body-sm text-xs shadow-sm">
                    <div>
                      <p className="font-bold text-heritage-navy">{selectedRoom.roomType} Room</p>
                      <p className="text-on-surface-variant text-[10px] mt-0.5">{selectedRoom.isAC ? 'AC' : 'Non-AC'}</p>
                    </div>
                    <p className="font-black font-display-sm text-heritage-navy">₹{selectedRoom.price} / night</p>
                  </div>
                )}

                {/* Datepickers */}
                <div>
                  <label className="font-label-sm text-[9px] text-on-surface-variant font-black uppercase tracking-wider block mb-1">Check In</label>
                  <div className="flex items-center bg-surface-bright border border-platinum-gray/50 p-3 rounded-2xl focus-within:border-steward-gold transition-colors">
                    <Calendar size={14} className="text-on-surface-variant mr-2" />
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-transparent font-body-sm text-xs text-heritage-navy outline-none w-full cursor-pointer font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-[9px] text-on-surface-variant font-black uppercase tracking-wider block mb-1">Check Out</label>
                  <div className="flex items-center bg-surface-bright border border-platinum-gray/50 p-3 rounded-2xl focus-within:border-steward-gold transition-colors">
                    <Calendar size={14} className="text-on-surface-variant mr-2" />
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="bg-transparent font-body-sm text-xs text-heritage-navy outline-none w-full cursor-pointer font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-sm text-[9px] text-on-surface-variant font-black uppercase tracking-wider block mb-1">Adults</label>
                    <select 
                      value={adults} 
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-surface-bright border border-platinum-gray/50 p-3 rounded-2xl font-body-sm text-xs text-heritage-navy font-semibold cursor-pointer outline-none focus:border-steward-gold transition-colors"
                    >
                      {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-surface-bright">{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-label-sm text-[9px] text-on-surface-variant font-black uppercase tracking-wider block mb-1">Children</label>
                    <select 
                      value={children} 
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-surface-bright border border-platinum-gray/50 p-3 rounded-2xl font-body-sm text-xs text-heritage-navy font-semibold cursor-pointer outline-none focus:border-steward-gold transition-colors"
                    >
                      {[0, 1, 2, 3].map(n => <option key={n} value={n} className="bg-surface-bright">{n}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="mt-6 w-full py-4 bg-heritage-navy text-linen-white font-label-md font-bold rounded-2xl hover:bg-primary-container transition shadow-lg text-xs uppercase tracking-wider"
                >
                  {user ? 'Confirm Reservation' : 'Login to Book'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
