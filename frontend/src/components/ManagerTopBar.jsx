import React from 'react';

export default function ManagerTopBar({ title = "Dashboard", onAddAction, showAddButton = false }) {
  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-20 px-10 flex items-center justify-between glass-nav border-b border-platinum-gray/20 shadow-sm">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="font-headline-md text-headline-md text-heritage-navy">{title}</h2>
        
        {/* Availability Filter & Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-platinum-gray rounded-xl py-2 pl-10 pr-4 font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-steward-gold focus:border-steward-gold transition-all" 
              placeholder="Search..." 
            />
          </div>
          {/* Mock Toggle */}
          <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border border-platinum-gray rounded-xl">
            <span className="font-label-md text-label-md text-on-surface-variant">Live Availability</span>
            <button role="switch" aria-checked="true" className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-steward-gold">
              <span aria-hidden="true" className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {showAddButton && (
          <button onClick={onAddAction} className="flex items-center gap-2 bg-heritage-navy text-linen-white px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all active:scale-95 shadow-lg">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Add New
          </button>
        )}
        <div className="flex items-center gap-2 border-l border-platinum-gray/30 pl-6">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-steward-gold transition-colors">notifications</span>
          <div className="w-10 h-10 rounded-full bg-platinum-gray overflow-hidden border border-steward-gold/20 flex items-center justify-center text-heritage-navy font-bold">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
