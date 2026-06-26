import React from 'react';

export default function ManagerRooms({ hotels, roomForm, setRoomForm, setShowAddRoomModal }) {
  // Aggregate all rooms across properties or group by property
  // For UI sake, we display them as room cards

  const allRooms = hotels.flatMap(hotel => 
    hotel.rooms?.map(room => ({ ...room, hotelName: hotel.name })) || []
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-heritage-navy">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Total Rooms</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">{allRooms.length}</h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">vpn_key</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Available Today</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">{Math.floor(allRooms.length * 0.4)}</h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-heritage-navy">
              <span className="material-symbols-outlined">cleaning_services</span>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md">Priority</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Needs Cleaning</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">8</h3>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-platinum-gray/30">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined">build</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Maintenance</p>
          <h3 className="font-display-lg text-display-lg text-heritage-navy">2</h3>
        </div>
      </div>

      {/* Properties section */}
      {hotels.map((hotel) => (
        <div key={hotel._id} className="bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 overflow-hidden card-shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-heritage-navy">{hotel.name}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{hotel.address}, {hotel.city}</p>
            </div>
            <button 
              onClick={() => { setRoomForm({ ...roomForm, hotelId: hotel._id }); setShowAddRoomModal(true); }}
              className="px-4 py-2 bg-steward-gold text-white rounded-lg font-label-md text-label-md shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Add Room Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotel.rooms?.map((room) => (
              <div key={room._id} className="border border-platinum-gray/30 rounded-xl overflow-hidden hover:border-steward-gold/50 transition-colors group">
                <div className="h-40 bg-surface-container relative">
                  {/* Image placeholder */}
                  <div className="absolute inset-0 bg-heritage-navy/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-platinum-gray">king_bed</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-surface-container-lowest/90 backdrop-blur rounded-md font-label-sm text-label-sm font-bold text-heritage-navy flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">fiber_manual_record</span> Available
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center text-on-surface-variant hover:text-heritage-navy transition-colors">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-title-lg text-title-lg text-heritage-navy">{room.roomType} Suite</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{room.bedType} • {room.roomSize}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-title-lg text-title-lg text-heritage-navy">₹{room.price}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">/ night</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mt-4">
                    <span className="px-2 py-1 bg-surface-container-low rounded font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">group</span> Max {room.maxGuests}
                    </span>
                    <span className={`px-2 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 ${room.isAC ? 'bg-primary-fixed text-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[12px]">ac_unit</span> {room.isAC ? 'AC' : 'Non-AC'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-platinum-gray/30 p-3 bg-surface-bright flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-steward-gold font-label-sm text-label-sm font-bold hover:underline">Edit Details</button>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer hover:text-heritage-navy">sensors</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer hover:text-heritage-navy">thermostat</span>
                  </div>
                </div>
              </div>
            ))}
            {(!hotel.rooms || hotel.rooms.length === 0) && (
              <div className="col-span-full py-8 text-center bg-surface-bright rounded-xl border border-dashed border-platinum-gray">
                <p className="font-label-md text-label-md text-on-surface-variant">No rooms added to this property yet.</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {hotels.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-platinum-gray/30 card-shadow">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hotel</span>
          <p className="font-label-md text-label-md">No property listings found.</p>
        </div>
      )}
    </div>
  );
}
