import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Calendar, Users, MapPin, Star, Award, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  const [city, setCity] = useState('');
  const [guests, setGuests] = useState(2);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch featured hotels (mocking/filtering public list)
    const fetchHotels = async () => {
      try {
        const res = await api.get('/hotels');
        if (res.data.success) {
          // Slice top 3 to act as premium featured properties
          setFeaturedHotels(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHotels();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${city}&guests=${guests}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden font-sans">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none -z-10 animate-float-slow"></div>
      <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-500/8 blur-[100px] pointer-events-none -z-10 animate-float-reverse"></div>
      <div className="absolute bottom-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[130px] pointer-events-none -z-10 animate-pulse-glow"></div>

      {/* Hero Section */}
      <div className="relative pt-44 pb-20 px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">StayLuxe Elite Collection</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black mb-8 max-w-5xl leading-none text-white tracking-tight font-serif italic animate-in fade-in duration-1000">
          Experience Luxury & Comfort <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent not-italic font-sans font-black">
            Without Compromise
          </span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mb-14 leading-relaxed font-light animate-in fade-in duration-1000 delay-200">
          Discover handpicked premium hotels, couples-friendly suites, and boutique resorts with transparent ratings and immediate booking approvals.
        </p>

        {/* Search Widget */}
        <form 
          onSubmit={handleSearch} 
          className="w-full max-w-4xl glass bg-slate-900/40 p-4 rounded-[28px] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 hover:border-white/20 transition-all"
        >
          {/* Destination */}
          <div className="flex-1 w-full flex items-center gap-3 bg-slate-950/45 p-4 rounded-2xl border border-white/5 focus-within:border-indigo-500/40 focus-within:bg-slate-950/80 transition-all duration-300">
            <MapPin className="text-indigo-400 shrink-0" size={20} />
            <div className="text-left w-full">
              <label className="text-[9px] text-indigo-300/70 font-black block uppercase tracking-widest mb-0.5">Destination</label>
              <input 
                type="text" 
                placeholder="Where are you going?" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder-gray-500"
                required
              />
            </div>
          </div>

          {/* Check In (Fixed) */}
          <div className="w-full md:w-44 flex items-center gap-3 bg-slate-950/45 p-4 rounded-2xl border border-white/5 hover:bg-slate-950/60 transition-all duration-300 cursor-pointer">
            <Calendar className="text-purple-400 shrink-0" size={20} />
            <div className="text-left">
              <label className="text-[9px] text-purple-300/70 font-black block uppercase tracking-widest mb-0.5">Check In</label>
              <span className="text-sm text-white font-semibold">Tomorrow</span>
            </div>
          </div>

          {/* Guests */}
          <div className="w-full md:w-48 flex items-center gap-3 bg-slate-950/45 p-4 rounded-2xl border border-white/5 focus-within:border-pink-500/40 focus-within:bg-slate-950/80 transition-all duration-300">
            <Users className="text-pink-400 shrink-0" size={20} />
            <div className="text-left w-full">
              <label className="text-[9px] text-pink-300/70 font-black block uppercase tracking-widest mb-0.5">Guests</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent text-sm text-white font-semibold outline-none border-none w-full cursor-pointer appearance-none pr-4"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num} className="bg-slate-950 text-white font-medium">{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full md:w-auto px-8 py-4 btn-luxury text-white font-bold rounded-2xl transition shadow-lg shrink-0 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
          >
            <Search size={18} /> Search Stay
          </button>
        </form>
      </div>

      {/* Featured Hotels */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-teal-400 font-extrabold text-[11px] uppercase tracking-widest mb-3">
              <Award size={13} /> Curated Masterpieces
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-black italic text-white mb-3">Featured Premium Properties</h2>
            <p className="text-gray-400 font-light max-w-xl">Handpicked retreats selected for impeccable ratings, premium service, and unparalleled comfort.</p>
          </div>
          <button 
            onClick={() => navigate('/search')} 
            className="text-indigo-400 font-bold hover:text-indigo-300 text-sm tracking-wider uppercase flex items-center gap-1 group transition cursor-pointer"
          >
            View All Properties <span className="group-hover:translate-x-1.5 transition-transform">→</span>
          </button>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredHotels.map((hotel) => (
            <div 
              key={hotel._id} 
              onClick={() => navigate(`/hotels/${hotel._id}`)}
              className="glass-glow rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Glowing Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Badges overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-indigo-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                      <Award size={10} /> Featured
                    </span>
                    {hotel.couplesFriendly && (
                      <span className="inline-flex items-center gap-1 bg-pink-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                        <Heart size={10} fill="currentColor" /> Couples Friendly
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-amber-400 flex items-center gap-1 text-xs font-black shadow-lg z-10">
                    <Star size={13} fill="currentColor" /> {hotel.rating}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-black uppercase tracking-wider mb-3">
                    <ShieldCheck size={13} /> Verified StayBadge
                  </div>
                  <h3 className="text-xl font-serif font-black italic text-white mb-2 truncate group-hover:text-indigo-400 transition-colors duration-300">{hotel.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed font-light">{hotel.description}</p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs text-gray-500">Starting from</span>
                  <p className="text-lg font-black text-white">₹{hotel.startingPrice}<span className="text-xs text-gray-500 font-normal"> / night</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription/Partner Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 mt-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl pointer-events-none -z-10"></div>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Partner Growth Network</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-black italic text-white mb-4">Manager Subscription Plans</h2>
          <p className="text-gray-400 max-w-xl mx-auto font-light text-sm leading-relaxed">Scale your hospitality business with advanced search priority placements, commission deductions, and detailed occupancy analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Plan 1 */}
          <div className="glass-glow bg-slate-900/15 border border-white/5 p-8 rounded-[28px] text-center flex flex-col justify-between hover:border-white/10 transition-all duration-300">
            <div>
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Basic tier</h4>
              <h3 className="text-4xl font-black text-white mb-2">Free</h3>
              <p className="text-gray-500 text-xs font-light mb-8">Standard listing tools</p>
              
              <div className="border-t border-white/5 my-6"></div>
              
              <ul className="text-left text-xs space-y-4 text-gray-400">
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> List up to 2 properties</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Standard room inventory control</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> 15% platform commission</li>
                <li className="text-gray-650 flex items-center gap-2"><span className="text-red-400/70 font-bold">✗</span> Analytics dashboard graphs</li>
                <li className="text-gray-650 flex items-center gap-2"><span className="text-red-400/70 font-bold">✗</span> Priority search listing boost</li>
              </ul>
            </div>
            <button className="mt-10 w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition font-bold text-xs uppercase tracking-wider cursor-pointer">Active by Default</button>
          </div>

          {/* Plan 2 - Featured */}
          <div className="glass-glow bg-slate-900/40 border-2 border-indigo-500/40 p-8 rounded-[28px] text-center relative flex flex-col justify-between shadow-[0_20px_50px_rgba(99,102,241,0.15)] hover:border-indigo-400 transition-all duration-500 group scale-[1.03]">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[9px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg">Popular Selection</span>
            <div>
              <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-6">Growth partner</h4>
              <h3 className="text-4xl font-black text-white mb-2">₹1,999<span className="text-sm font-normal text-gray-500"> / mo</span></h3>
              <p className="text-indigo-200/60 text-xs font-light mb-8">Enhanced discoverability boost</p>
              
              <div className="border-t border-white/5 my-6"></div>
              
              <ul className="text-left text-xs space-y-4 text-gray-200">
                <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span> List up to 10 properties</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span> Full room inventory & coupons</li>
                <li className="flex items-center gap-2 font-bold text-teal-400"><span className="text-teal-400">✓</span> Reduced 10% commission</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span> Access to analytical graphs</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span> Standard search priority</li>
              </ul>
            </div>
            <button className="mt-10 w-full py-4 btn-luxury text-white rounded-xl transition font-bold text-xs uppercase tracking-wider cursor-pointer">Upgrade Account</button>
          </div>

          {/* Plan 3 */}
          <div className="glass-glow bg-slate-900/15 border border-white/5 p-8 rounded-[28px] text-center flex flex-col justify-between hover:border-white/10 transition-all duration-300">
            <div>
              <h4 className="text-[11px] font-black text-purple-300 uppercase tracking-widest mb-6">Luxury network</h4>
              <h3 className="text-4xl font-black text-white mb-2">₹4,999<span className="text-sm font-normal text-gray-500"> / mo</span></h3>
              <p className="text-gray-500 text-xs font-light mb-8">Complete search dominance</p>
              
              <div className="border-t border-white/5 my-6"></div>
              
              <ul className="text-left text-xs space-y-4 text-gray-400">
                <li className="flex items-center gap-2 text-white"><span className="text-purple-400 font-bold">✓</span> Unlimited hotel listings</li>
                <li className="flex items-center gap-2 text-white"><span className="text-purple-400 font-bold">✓</span> Dynamic inventory calendars</li>
                <li className="flex items-center gap-2 text-teal-400 font-bold"><span className="text-teal-400">✓</span> Only 5% platform commission</li>
                <li className="flex items-center gap-2 text-white"><span className="text-purple-400 font-bold">✓</span> Advanced occupancy analytics</li>
                <li className="flex items-center gap-2 text-white font-bold"><span className="text-purple-400 font-bold">✓</span> Top Search priority + Featured flag</li>
              </ul>
            </div>
            <button className="mt-10 w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition font-bold text-xs uppercase tracking-wider cursor-pointer">Unlock Premium</button>
          </div>
        </div>
      </div>
    </div>
  );
}

