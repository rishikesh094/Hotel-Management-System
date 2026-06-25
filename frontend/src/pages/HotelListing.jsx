import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Star, MapPin, SlidersHorizontal, Heart, ShieldCheck, Search, ShieldCheckIcon } from 'lucide-react';

export default function HotelListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [hotelType, setHotelType] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('');

  const amenitiesList = [
    { value: 'AC', label: 'Air Conditioning' },
    { value: 'Free WiFi', label: 'Free WiFi' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Pool', label: 'Swimming Pool' },
    { value: 'Spa', label: 'Spa' },
    { value: 'Gym', label: 'Fitness Center' },
    { value: 'Restaurant', label: 'Restaurant' }
  ];

  const fetchHotels = async () => {
    setLoading(true);
    try {
      let queryStr = `/hotels?minPrice=${minPrice}&maxPrice=${maxPrice}`;
      
      if (city) {
        queryStr += `&city=${city}`;
      }
      if (hotelType) {
        queryStr += `&hotelType=${hotelType}`;
      }
      if (selectedAmenities.length > 0) {
        queryStr += `&amenities=${selectedAmenities.join(',')}`;
      }
      if (ratingFilter) {
        queryStr += `&rating[gte]=${ratingFilter}`;
      }

      const res = await api.get(queryStr);
      if (res.data.success) {
        setHotels(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching filtered hotels', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams, hotelType, minPrice, maxPrice, selectedAmenities, ratingFilter]);

  const handleAmenityChange = (value) => {
    if (selectedAmenities.includes(value)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== value));
    } else {
      setSelectedAmenities([...selectedAmenities, value]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="pt-28 px-6 max-w-7xl mx-auto pb-16 min-h-screen bg-slate-950 text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 glass bg-slate-900/40 border border-slate-900 p-6 rounded-3xl h-fit sticky top-28">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-900">
            <SlidersHorizontal size={18} className="text-indigo-400" />
            <h3 className="font-black text-white text-lg">Filters</h3>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-2">Location</label>
              <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 p-2 rounded-xl">
                <Search size={14} className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search city..." 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent text-xs w-full text-white outline-none"
                />
              </div>
            </div>

            {/* Hotel Type */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-2">Property Type</label>
              <select 
                value={hotelType} 
                onChange={(e) => setHotelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="Luxury">Luxury</option>
                <option value="Budget">Budget</option>
                <option value="Resort">Resort</option>
                <option value="Villa">Villa</option>
                <option value="Boutique">Boutique</option>
                <option value="Business">Business</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Max Price</label>
                <span className="text-xs font-bold text-white">₹{maxPrice}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30000" 
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-2">Minimum Rating</label>
              <div className="flex gap-2">
                {['3', '4', '4.5'].map((star) => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setRatingFilter(ratingFilter === star ? '' : star)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      ratingFilter === star 
                        ? 'bg-indigo-500 text-white border-indigo-500' 
                        : 'bg-slate-950 text-gray-400 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {star}★+
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-2">Amenities</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {amenitiesList.map((amenity) => (
                  <label key={amenity.value} className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.value)}
                      onChange={() => handleAmenityChange(amenity.value)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Listings Queue */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white">
              {loading ? 'Searching stays...' : `${hotels.length} approved stays found`}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(skeleton => (
                <div key={skeleton} className="glass bg-slate-900/20 border border-slate-900/50 p-4 rounded-3xl h-60 animate-pulse flex gap-6">
                  <div className="w-1/3 bg-slate-900 rounded-2xl h-full"></div>
                  <div className="w-2/3 space-y-4 py-4">
                    <div className="h-6 bg-slate-900 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-900 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-900 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <div 
                  key={hotel._id}
                  onClick={() => navigate(`/hotels/${hotel._id}`)}
                  className="glass bg-slate-900/20 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-6 cursor-pointer hover:-translate-y-1 transition duration-300 group"
                >
                  {/* Photo container */}
                  <div className="w-full md:w-72 h-48 rounded-2xl overflow-hidden shrink-0 relative bg-slate-900">
                    <img 
                      src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                    />
                    {hotel.couplesFriendly && (
                      <span className="absolute top-3 left-3 bg-pink-600/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded-full">
                        Couples Friendly
                      </span>
                    )}
                  </div>

                  {/* Info block */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-1 text-[9px] text-teal-400 font-extrabold uppercase tracking-widest mb-1">
                            <ShieldCheck size={11} /> StayBadge Verified
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{hotel.name}</h3>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl text-amber-400 flex items-center gap-1 text-xs font-bold">
                          <Star size={12} fill="currentColor" /> {hotel.rating}
                        </div>
                      </div>

                      <p className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <MapPin size={12} /> {hotel.address}, {hotel.city}, {hotel.state}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 4).map(amenity => (
                          <span key={amenity} className="text-[10px] bg-slate-950 border border-slate-900 text-gray-400 px-2.5 py-1 rounded-lg">
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-[10px] text-gray-600 font-bold px-1.5 py-1">
                            +{hotel.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-900/50 pt-4">
                      <div>
                        {hotel.discount > 0 && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold mr-2">
                            {hotel.discount}% OFF
                          </span>
                        )}
                        <span className="text-xs text-gray-600">Starting from</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">₹{hotel.startingPrice}</p>
                        <p className="text-[9px] text-gray-600">Excl. taxes & fees</p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

              {hotels.length === 0 && (
                <div className="text-center py-20 glass bg-slate-900/10 rounded-3xl border border-slate-900">
                  <p className="text-gray-500 mb-2">No hotel listings fit your filters.</p>
                  <button 
                    onClick={() => { setCity(''); setHotelType(''); setSelectedAmenities([]); setMaxPrice(25000); }} 
                    className="text-xs font-bold text-indigo-400 hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
