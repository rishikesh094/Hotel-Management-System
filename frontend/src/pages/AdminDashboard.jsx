import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Hotel, FileCheck, DollarSign, Check, X, Eye, ShieldAlert, Award, FileText, Ban, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hotelsQueue, setHotelsQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'applications', 'hotels', 'users', 'logs'
  const [activeTab, setActiveTab] = useState('applications');

  // Document Viewer Modal State
  const [selectedAppDocs, setSelectedAppDocs] = useState(null);

  // Fetch admin dashboard details
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats & alerts
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch Partner Apps
      const appsRes = await api.get('/admin/manager-applications');
      if (appsRes.data.success) {
        setApplications(appsRes.data.data);
      }

      // 3. Fetch Hotels Queue
      const queueRes = await api.get('/admin/hotels/approval-queue');
      if (queueRes.data.success) {
        setHotelsQueue(queueRes.data.data);
      }

      // 4. Fetch Logs
      const logsRes = await api.get('/admin/logs');
      if (logsRes.data.success) {
        setLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Approve manager
  const handleApproveManager = async (id) => {
    if (!window.confirm('Approve this hotel manager application?')) return;
    try {
      const res = await api.put(`/admin/manager-applications/${id}/approve`);
      if (res.data.success) {
        alert('Manager approved and account upgraded successfully!');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Approval failed');
    }
  };

  // Reject manager
  const handleRejectManager = async (id) => {
    const reason = prompt('Enter the official rejection reason details:');
    if (!reason) return;
    try {
      const res = await api.put(`/admin/manager-applications/${id}/reject`, {
        rejectionReason: reason
      });
      if (res.data.success) {
        alert('Application rejected successfully.');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  // Approve hotel property
  const handleApproveHotel = async (id) => {
    if (!window.confirm('Approve this hotel property and make it Live?')) return;
    try {
      const res = await api.put(`/admin/hotels/${id}/approve`);
      if (res.data.success) {
        alert('Hotel is now LIVE on search listings!');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Hotel approval failed');
    }
  };

  // Reject hotel property
  const handleRejectHotel = async (id) => {
    const reason = prompt('Enter reasons for property listing rejection:');
    if (!reason) return;
    try {
      const res = await api.put(`/admin/hotels/${id}/reject`, {
        rejectionReason: reason
      });
      if (res.data.success) {
        alert('Hotel listing rejected successfully.');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  // Suspend user account
  const handleSuspendUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to suspend the user: ${email}?`)) return;
    try {
      const res = await api.put(`/admin/users/${id}/suspend`);
      if (res.data.success) {
        alert('User has been suspended.');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  // Ban user account
  const handleBanUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to BAN the user: ${email} permanently?`)) return;
    try {
      const res = await api.put(`/admin/users/${id}/ban`);
      if (res.data.success) {
        alert('User has been permanently banned.');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-steward-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Visual layout statistics cards
  const statsList = [
    { title: 'Total Booking Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
    { title: 'Total Catalog Hotels', value: stats?.totalHotels || 0, icon: Hotel, color: 'text-heritage-navy', bg: 'bg-surface-bright border border-platinum-gray/50' },
    { title: 'Verified Managers', value: stats?.totalManagers || 0, icon: Users, color: 'text-steward-gold', bg: 'bg-steward-gold/10' },
    { title: 'Pending Approval Items', value: (applications.filter(a => a.status !== 'Approved' && a.status !== 'Rejected').length) + hotelsQueue.length, icon: FileCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="pt-36 px-6 max-w-7xl mx-auto pb-20 min-h-screen bg-surface text-on-surface font-body-md">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-headline-lg font-black text-heritage-navy">Super Admin Console</h1>
          <p className="text-on-surface-variant font-body-sm text-xs">Overview metrics, managers and properties catalog verification queue.</p>
        </div>
        <button onClick={loadDashboardData} className="p-3 bg-surface-container-lowest border border-platinum-gray/50 rounded-xl hover:border-steward-gold transition flex items-center gap-2 font-label-md text-xs font-bold text-heritage-navy shadow-sm">
          <RefreshCw size={14} /> Sync Live Data
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsList.map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant text-[10px] uppercase font-black tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-display-sm font-black text-heritage-navy mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Graph & Fraud Alerts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Occupancy/Revenue Simulated Bar graph */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
          <h3 className="text-sm font-label-sm font-black text-heritage-navy uppercase tracking-wider mb-6">Revenue Growth Trend (Last 6 Months)</h3>
          
          <div className="flex items-end gap-6 h-56 px-4">
            {stats?.charts?.revenue.map((val, idx) => {
              const maxVal = Math.max(...stats.charts.revenue);
              const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <span className="text-[10px] text-steward-gold font-bold opacity-0 group-hover:opacity-100 transition duration-300">₹{val.toLocaleString()}</span>
                  <div 
                    className="w-full bg-heritage-navy rounded-t-lg transition-all duration-700" 
                    style={{ height: `${heightPercent * 0.7}%` }}
                  ></div>
                  <span className="font-label-sm text-[10px] text-on-surface-variant mt-2 font-bold">{stats.charts.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Fraud & Audit alerts */}
        <div className="bg-surface-container-lowest border border-platinum-gray/50 p-6 rounded-3xl card-shadow">
          <h3 className="text-sm font-label-sm font-black text-heritage-navy uppercase tracking-wider mb-4">Fraud Detection & Activity Logs</h3>
          <div className="space-y-3">
            {stats?.fraudAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-2xl font-body-sm text-xs flex gap-3 shadow-sm ${
                  alert.severity === 'danger' 
                    ? 'bg-error/10 border-error/20 text-error' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                }`}
              >
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px]">{alert.type.replace('_', ' ')}</p>
                  <p className="text-on-surface-variant mt-1 leading-snug">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Tabs Verification Areas */}
      <div className="bg-surface-container-lowest border border-platinum-gray/50 rounded-3xl p-6 card-shadow">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-platinum-gray/30 mb-6 pb-2">
          {['applications', 'hotels', 'logs'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-label-sm text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'text-steward-gold border-b-2 border-steward-gold' 
                  : 'text-on-surface-variant hover:text-heritage-navy'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab 1: Partner Verification applications */}
        {activeTab === 'applications' && (
          <div className="overflow-x-auto text-xs font-body-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-platinum-gray/30 text-on-surface-variant font-label-sm">
                  <th className="pb-3 font-bold uppercase tracking-wider">Applicant / Email</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Business Name</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">UPI / Account</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-platinum-gray/30 hover:bg-surface-bright transition">
                    <td className="py-4 font-bold text-heritage-navy">
                      <p>{app.user?.name || 'Partner Account'}</p>
                      <p className="font-label-sm text-[10px] text-on-surface-variant font-normal mt-0.5">{app.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-heritage-navy">
                      <p className="font-bold">{app.businessName}</p>
                      <span className="font-label-sm text-[9px] text-on-surface-variant">{app.city}, {app.state}</span>
                    </td>
                    <td className="py-4 text-heritage-navy">
                      <p>{app.bankDetails?.upiId || 'N/A'}</p>
                      <p className="font-label-sm text-[9px] text-on-surface-variant mt-0.5">{app.bankDetails?.bankName} ({app.bankDetails?.accountNumber})</p>
                    </td>
                    <td className="py-4">
                      <span className={`font-label-sm px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-sm border ${
                        app.status === 'Approved' ? 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20' :
                        app.status === 'Rejected' ? 'bg-error/10 text-error border-error/20' :
                        app.status === 'Under Review' ? 'bg-heritage-navy/10 text-heritage-navy border-heritage-navy/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Secure Document view modal launcher */}
                        <button 
                          onClick={() => setSelectedAppDocs(app)}
                          className="p-2 bg-surface-bright hover:bg-surface-container text-on-surface-variant hover:text-heritage-navy rounded-xl border border-platinum-gray/50 shadow-sm" 
                          title="Verify Uploaded Files"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {app.status !== 'Approved' && (
                          <>
                            <button 
                              onClick={() => handleApproveManager(app._id)}
                              className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 rounded-xl border border-emerald-600/20 shadow-sm" 
                              title="Approve Partnership"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleRejectManager(app._id)}
                              className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-xl border border-error/20 shadow-sm" 
                              title="Decline / Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-on-surface-variant font-body-sm">No partner verification applications pending.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Hotels queue */}
        {activeTab === 'hotels' && (
          <div className="overflow-x-auto text-xs font-body-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-platinum-gray/30 text-on-surface-variant font-label-sm">
                  <th className="pb-3 font-bold uppercase tracking-wider">Hotel Property</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Manager / Owner</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Starting Price</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">City / Address</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotelsQueue.map((hotel) => (
                  <tr key={hotel._id} className="border-b border-platinum-gray/30 hover:bg-surface-bright transition">
                    <td className="py-4 font-bold text-heritage-navy">{hotel.name}</td>
                    <td className="py-4 text-heritage-navy">
                      <p>{hotel.manager?.name || 'N/A'}</p>
                      <p className="font-label-sm text-[10px] text-on-surface-variant">{hotel.manager?.email || ''}</p>
                    </td>
                    <td className="py-4 text-heritage-navy font-bold">₹{hotel.startingPrice}</td>
                    <td className="py-4 text-heritage-navy">{hotel.city}, {hotel.state}</td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleApproveHotel(hotel._id)}
                          className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 rounded-xl border border-emerald-600/20 shadow-sm" 
                          title="Approve Property Listing"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => handleRejectHotel(hotel._id)}
                          className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-xl border border-error/20 shadow-sm" 
                          title="Reject Listing"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {hotelsQueue.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-on-surface-variant font-body-sm">No hotel property listings awaiting verification.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: System Logs audit trail */}
        {activeTab === 'logs' && (
          <div className="overflow-x-auto text-xs font-body-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-platinum-gray/30 text-on-surface-variant font-label-sm">
                  <th className="pb-3 font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Admin Agent</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Audited Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-platinum-gray/30 hover:bg-surface-bright transition">
                    <td className="py-4 text-on-surface-variant font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 text-steward-gold font-bold">
                      {log.user?.name || 'Admin'}
                    </td>
                    <td className="py-4 text-heritage-navy font-medium leading-relaxed">{log.action}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-on-surface-variant font-body-sm">No admin operations audited in logs database yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SECURE DOCUMENT VIEWER MODAL POPUP */}
      {selectedAppDocs && (
        <div className="fixed inset-0 bg-heritage-navy/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-platinum-gray/50 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedAppDocs(null)}
              className="absolute top-4 right-4 p-2 bg-surface hover:bg-surface-bright rounded-xl text-on-surface-variant hover:text-heritage-navy transition border border-platinum-gray/50 shadow-sm"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-title-lg font-black text-heritage-navy mb-4">Official Verification Documents: {selectedAppDocs.businessName}</h3>
            
            {/* Embedded image grids loaded with credentials directly from /api/upload/secure/:filename */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div>
                <h4 className="font-label-sm text-[10px] text-on-surface-variant uppercase font-black mb-2">Aadhaar Card Upload</h4>
                <div className="h-56 bg-surface-container rounded-2xl overflow-hidden border border-platinum-gray/50 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.aadhaarCard ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.aadhaarCard.substring(8)}`} 
                      alt="Aadhaar" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-on-surface-variant font-bold">No file uploaded</span>}
                </div>
              </div>

              <div>
                <h4 className="font-label-sm text-[10px] text-on-surface-variant uppercase font-black mb-2">PAN Card Upload</h4>
                <div className="h-56 bg-surface-container rounded-2xl overflow-hidden border border-platinum-gray/50 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.panCard ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.panCard.substring(8)}`} 
                      alt="PAN" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-on-surface-variant font-bold">No file uploaded</span>}
                </div>
              </div>

              <div>
                <h4 className="font-label-sm text-[10px] text-on-surface-variant uppercase font-black mb-2">Hotel / Business License</h4>
                <div className="h-56 bg-surface-container rounded-2xl overflow-hidden border border-platinum-gray/50 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.hotelLicense ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.hotelLicense.substring(8)}`} 
                      alt="License" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-on-surface-variant font-bold">No file uploaded</span>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-platinum-gray/30 flex justify-between items-center font-body-sm text-xs">
              <span className="text-on-surface-variant">Applicant: {selectedAppDocs.user?.name} (Aadhaar: {selectedAppDocs.aadhaarNumber})</span>
              <button 
                onClick={() => setSelectedAppDocs(null)} 
                className="px-6 py-2.5 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl font-bold font-label-md shadow-sm"
              >
                Close document Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
