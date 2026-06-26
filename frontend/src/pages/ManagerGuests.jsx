import React from 'react';

export default function ManagerGuests({ bookings }) {
  // Derive guests from bookings to match the design's "Guest Directory"
  const guests = Array.from(new Map(bookings.map(b => [b.user?._id, {
    _id: b.user?._id,
    name: b.user?.name || 'Unknown',
    email: b.user?.email || 'N/A',
    tier: 'Gold', // Mock tier
    totalSpent: bookings.filter(bk => bk.user?._id === b.user?._id).reduce((sum, bk) => sum + bk.totalAmount, 0),
    lastStay: new Date(b.checkOutDate).toLocaleDateString()
  }])).values());

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Controls */}
      <div className="flex justify-between items-end gap-4">
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest border border-platinum-gray rounded-xl p-1 flex">
            <button className="px-6 py-2 rounded-lg bg-heritage-navy text-linen-white font-label-md text-label-md shadow-md">All Guests</button>
            <button className="px-6 py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors">VIP / Elite</button>
            <button className="px-6 py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors">In-House</button>
          </div>
        </div>
        <button className="flex items-center gap-2 border border-platinum-gray px-4 py-2.5 rounded-xl font-label-md text-label-md text-heritage-navy hover:bg-surface-container-low transition-colors bg-surface-container-lowest shadow-sm">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Advanced Filter
        </button>
      </div>

      {/* Guest Directory Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-platinum-gray/30">
                <th className="p-5 font-semibold">Guest Name</th>
                <th className="p-5 font-semibold">Contact Info</th>
                <th className="p-5 font-semibold">Loyalty Tier</th>
                <th className="p-5 font-semibold">Total Lifetime Spend</th>
                <th className="p-5 font-semibold">Last Stay</th>
                <th className="p-5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-heritage-navy">
              {guests.length > 0 ? (
                guests.map((guest, idx) => (
                  <tr key={guest._id || idx} className="border-b border-platinum-gray/10 guest-row transition-colors cursor-pointer">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed text-heritage-navy flex items-center justify-center font-bold text-sm">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{guest.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">ID: {guest._id?.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                          {guest.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container border border-steward-gold/30">
                        {guest.tier}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="font-semibold text-base">₹{guest.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="p-5 text-on-surface-variant">
                      {guest.lastStay}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-heritage-navy hover:bg-surface-container transition-colors" title="View Profile">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-heritage-navy hover:bg-surface-container transition-colors" title="Message Guest">
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant font-label-md">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">group_off</span>
                      <p>No guests found in the directory.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-platinum-gray/30 flex justify-between items-center bg-surface-container-lowest">
          <p className="font-label-md text-label-md text-on-surface-variant">Showing {guests.length} guests</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded border border-platinum-gray flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded border border-steward-gold bg-steward-gold/10 flex items-center justify-center text-steward-gold font-bold transition-colors">
              1
            </button>
            <button className="w-8 h-8 rounded border border-platinum-gray flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
