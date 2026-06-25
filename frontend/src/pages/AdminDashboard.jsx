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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Visual layout statistics cards
  const statsList = [
    { title: 'Total Booking Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Catalog Hotels', value: stats?.totalHotels || 0, icon: Hotel, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Verified Managers', value: stats?.totalManagers || 0, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Pending Approval Items', value: (applications.filter(a => a.status !== 'Approved' && a.status !== 'Rejected').length) + hotelsQueue.length, icon: FileCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="pt-36 px-6 max-w-7xl mx-auto pb-20 min-h-screen bg-slate-950 text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Super Admin Console</h1>
          <p className="text-gray-400 text-xs">Overview metrics, managers and properties catalog verification queue.</p>
        </div>
        <button onClick={loadDashboardData} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-center gap-2 text-xs font-bold text-gray-300">
          <RefreshCw size={14} /> Sync Live Data
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsList.map((stat, i) => (
          <div key={i} className="glass bg-slate-900 border border-slate-850 p-6 rounded-3xl flex items-center gap-4 shadow-xl">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Graph & Fraud Alerts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Occupancy/Revenue Simulated Bar graph */}
        <div className="lg:col-span-2 glass bg-slate-900/60 border border-slate-900 p-6 rounded-3xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">Revenue Growth Trend (Last 6 Months)</h3>
          
          <div className="flex items-end gap-6 h-56 px-4">
            {stats?.charts?.revenue.map((val, idx) => {
              const maxVal = Math.max(...stats.charts.revenue);
              const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition duration-300">₹{val.toLocaleString()}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 rounded-t-lg transition-all duration-700" 
                    style={{ height: `${heightPercent * 0.7}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 mt-2 font-bold">{stats.charts.labels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Fraud & Audit alerts */}
        <div className="glass bg-slate-900/40 border border-slate-900 p-6 rounded-3xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Fraud Detection & Activity Logs</h3>
          <div className="space-y-3">
            {stats?.fraudAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-2xl text-xs flex gap-3 ${
                  alert.severity === 'danger' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px]">{alert.type.replace('_', ' ')}</p>
                  <p className="text-gray-400 mt-1 leading-snug">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Tabs Verification Areas */}
      <div className="glass bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-900 mb-6 pb-2">
          {['applications', 'hotels', 'logs'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'text-indigo-400 border-b-2 border-indigo-400' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab 1: Partner Verification applications */}
        {activeTab === 'applications' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-gray-500 font-bold">
                  <th className="pb-3 font-bold uppercase tracking-wider">Applicant / Email</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Business Name</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">UPI / Account</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-slate-900/40 hover:bg-slate-950/20 transition">
                    <td className="py-4 font-bold text-white">
                      <p>{app.user?.name || 'Partner Account'}</p>
                      <p className="text-[10px] text-gray-500 font-normal mt-0.5">{app.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-gray-300">
                      <p className="font-bold">{app.businessName}</p>
                      <span className="text-[9px] text-gray-500">{app.city}, {app.state}</span>
                    </td>
                    <td className="py-4 text-gray-400">
                      <p>{app.bankDetails?.upiId || 'N/A'}</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">{app.bankDetails?.bankName} ({app.bankDetails?.accountNumber})</p>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        app.status === 'Approved' ? 'bg-teal-500/10 text-teal-400' :
                        app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                        app.status === 'Under Review' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Secure Document view modal launcher */}
                        <button 
                          onClick={() => setSelectedAppDocs(app)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-gray-400 hover:text-white rounded-xl border border-slate-850" 
                          title="Verify Uploaded Files"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {app.status !== 'Approved' && (
                          <>
                            <button 
                              onClick={() => handleApproveManager(app._id)}
                              className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/20" 
                              title="Approve Partnership"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleRejectManager(app._id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20" 
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
                    <td colSpan="5" className="py-12 text-center text-gray-500">No partner verification applications pending.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Hotels queue */}
        {activeTab === 'hotels' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-gray-500 font-bold">
                  <th className="pb-3 font-bold uppercase tracking-wider">Hotel Property</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Manager / Owner</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Starting Price</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">City / Address</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotelsQueue.map((hotel) => (
                  <tr key={hotel._id} className="border-b border-slate-900/40 hover:bg-slate-950/20 transition">
                    <td className="py-4 font-bold text-white">{hotel.name}</td>
                    <td className="py-4 text-gray-300">
                      <p>{hotel.manager?.name || 'N/A'}</p>
                      <p className="text-[10px] text-gray-500">{hotel.manager?.email || ''}</p>
                    </td>
                    <td className="py-4 text-gray-400 font-bold">₹{hotel.startingPrice}</td>
                    <td className="py-4 text-gray-400">{hotel.city}, {hotel.state}</td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleApproveHotel(hotel._id)}
                          className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/20" 
                          title="Approve Property Listing"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => handleRejectHotel(hotel._id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20" 
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
                    <td colSpan="5" className="py-12 text-center text-gray-500">No hotel property listings awaiting verification.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: System Logs audit trail */}
        {activeTab === 'logs' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-gray-500 font-bold">
                  <th className="pb-3 font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Admin Agent</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Audited Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-900/40 hover:bg-slate-950/20 transition">
                    <td className="py-4 text-gray-500 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 text-indigo-400 font-bold">
                      {log.user?.name || 'Admin'}
                    </td>
                    <td className="py-4 text-gray-300 font-medium leading-relaxed">{log.action}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500">No admin operations audited in logs database yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SECURE DOCUMENT VIEWER MODAL POPUP */}
      {selectedAppDocs && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="glass bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedAppDocs(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-850 rounded-xl text-gray-400 hover:text-white transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Official Verification Documents: {selectedAppDocs.businessName}</h3>
            
            {/* Embedded image grids loaded with credentials directly from /api/upload/secure/:filename */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] pr-2">
              <div>
                <h4 className="text-[10px] text-gray-500 uppercase font-black mb-2">Aadhaar Card Upload</h4>
                <div className="h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.aadhaarCard ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.aadhaarCard.substring(8)}`} 
                      alt="Aadhaar" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-gray-600 font-bold">No file uploaded</span>}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-gray-500 uppercase font-black mb-2">PAN Card Upload</h4>
                <div className="h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.panCard ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.panCard.substring(8)}`} 
                      alt="PAN" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-gray-600 font-bold">No file uploaded</span>}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-gray-500 uppercase font-black mb-2">Hotel / Business License</h4>
                <div className="h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex items-center justify-center text-xs">
                  {selectedAppDocs.documents?.hotelLicense ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '')}/upload/secure${selectedAppDocs.documents.hotelLicense.substring(8)}`} 
                      alt="License" 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c53cd381612a'; }}
                    />
                  ) : <span className="text-gray-600 font-bold">No file uploaded</span>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center text-xs">
              <span className="text-gray-500">Applicant: {selectedAppDocs.user?.name} (Aadhaar: {selectedAppDocs.aadhaarNumber})</span>
              <button 
                onClick={() => setSelectedAppDocs(null)} 
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
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
