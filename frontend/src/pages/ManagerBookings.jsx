import React from 'react';

export default function ManagerBookings({ bookings }) {
  // Mock data for the tape chart
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: d.getDate().toString()
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-heritage-navy">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md">+12%</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Occupancy Rate</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">84<span className="text-headline-md text-platinum-gray">%</span></h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">RevPAR</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy"><span className="text-headline-md text-platinum-gray">₹</span>14.2<span className="text-headline-md text-platinum-gray">k</span></h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-heritage-navy">
              <span className="material-symbols-outlined">flight_land</span>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md">Today</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Arrivals</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">24</h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-heritage-navy">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md">Today</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Departures</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">18</h3>
        </div>
      </div>

      {/* Tape Chart */}
      <div className="bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 overflow-hidden card-shadow">
        <div className="p-6 border-b border-platinum-gray/30 flex justify-between items-center">
          <div>
            <h3 className="font-title-lg text-title-lg text-heritage-navy">Visual Tape Chart</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Drag to adjust bookings, click for details.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-platinum-gray rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors">Today</button>
            <div className="flex rounded-lg border border-platinum-gray overflow-hidden">
              <button className="px-3 py-2 border-r border-platinum-gray bg-surface-container-low hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="px-3 py-2 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto tape-chart-container">
          <div className="min-w-[1200px]">
            <div className="flex border-b border-platinum-gray/30 bg-surface-container-lowest sticky top-0 z-10">
              <div className="w-48 shrink-0 p-4 border-r border-platinum-gray/30 bg-surface-container-lowest z-20 font-label-md text-label-md text-on-surface-variant flex items-end">
                Room / Date
              </div>
              <div className="flex-1 flex tape-chart-grid">
                {days.map((d, i) => (
                  <div key={i} className={`w-[80px] shrink-0 p-2 text-center border-r border-platinum-gray/10 ${i===2 ? 'bg-steward-gold/5 border-b-2 border-b-steward-gold' : ''}`}>
                    <p className={`font-label-sm text-label-sm ${i===2 ? 'text-steward-gold' : 'text-on-surface-variant'}`}>{d.dayStr}</p>
                    <p className={`font-title-lg text-title-lg mt-1 ${i===2 ? 'text-steward-gold' : 'text-heritage-navy'}`}>{d.dateStr}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              {['101 - King Suite', '102 - Double', '201 - Executive', '202 - King Suite', '301 - Penthouse'].map((room, i) => (
                <div key={i} className="flex border-b border-platinum-gray/10 hover:bg-surface-container-low/50 transition-colors">
                  <div className="w-48 shrink-0 p-4 border-r border-platinum-gray/30 bg-surface-container-lowest z-20 flex items-center justify-between">
                    <span className="font-label-md text-label-md text-heritage-navy">{room}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="flex-1 tape-chart-grid relative h-16">
                    {/* Mock Bookings visually */}
                    {i === 0 && (
                      <div className="absolute top-2 left-[40px] w-[200px] h-12 bg-primary-fixed rounded-lg border border-primary-fixed-dim p-2 cursor-pointer hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-center">
                          <span className="font-label-sm text-label-sm text-heritage-navy font-bold">Thorne, A.</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">VIP</span>
                        </div>
                        <div className="w-full bg-white/50 h-1 mt-1.5 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-heritage-navy/30"></div>
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="absolute top-2 left-[200px] w-[320px] h-12 bg-secondary-fixed rounded-lg border border-secondary-fixed-dim p-2 cursor-pointer hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-center">
                          <span className="font-label-sm text-label-sm text-on-secondary-fixed font-bold">Chen, W.</span>
                          <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">monetization_on</span> Unpaid</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 overflow-hidden card-shadow">
        <div className="p-6 border-b border-platinum-gray/30 flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-heritage-navy">Recent Bookings</h3>
          <button className="text-steward-gold font-label-md text-label-md hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="p-4 rounded-tl-xl">Guest</th>
                <th className="p-4">Room / Type</th>
                <th className="p-4">Check In/Out</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right rounded-tr-xl">Total Amount</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-heritage-navy">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-platinum-gray/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-heritage-navy flex items-center justify-center font-bold text-xs">
                          {booking.user?.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="font-semibold">{booking.user?.name || 'Guest'}</p>
                          <p className="text-xs text-on-surface-variant">{booking._id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{booking.room?.roomType || 'Standard'}</p>
                      <p className="text-xs text-on-surface-variant">{booking.hotel?.name}</p>
                    </td>
                    <td className="p-4">
                      <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                      <p className="text-xs text-on-surface-variant">to {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600' :
                        booking.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      ₹{booking.totalAmount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
