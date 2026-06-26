import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Mail, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export default function PartnerOnboarding() {
  const { user, token, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(null);
  const [checkingApp, setCheckingApp] = useState(true);

  // Form stepper state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    aadhaarNumber: '',
    panNumber: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarCard: null,
    panCard: null,
    hotelLicense: null,
    gstCertificate: null,
    businessProof: null
  });

  const [fileUrls, setFileUrls] = useState({
    profilePhoto: '',
    aadhaarCard: '',
    panCard: '',
    hotelLicense: '',
    gstCertificate: '',
    businessProof: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current application status
  const checkStatus = async () => {
    if (!token) {
      setCheckingApp(false);
      return;
    }
    try {
      const res = await api.get('/manager-applications/status');
      if (res.data.success && res.data.data) {
        setExistingApp(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setCheckingApp(false);
  };

  useEffect(() => {
    checkStatus();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Upload file utility
  const uploadSingleFile = async (fileField, fileObj) => {
    if (!fileObj) return '';
    const uploadData = new FormData();
    uploadData.append('document', fileObj);

    const res = await api.post('/upload', uploadData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUploading(true);
    setUploadProgress(10);

    try {
      // 1. Upload documents one by one and track progress
      const urls = { ...fileUrls };
      
      setUploadProgress(20);
      if (files.profilePhoto) {
        urls.profilePhoto = await uploadSingleFile('profilePhoto', files.profilePhoto);
      }
      setUploadProgress(40);
      if (files.aadhaarCard) {
        urls.aadhaarCard = await uploadSingleFile('aadhaarCard', files.aadhaarCard);
      }
      setUploadProgress(60);
      if (files.panCard) {
        urls.panCard = await uploadSingleFile('panCard', files.panCard);
      }
      setUploadProgress(80);
      if (files.hotelLicense) {
        urls.hotelLicense = await uploadSingleFile('hotelLicense', files.hotelLicense);
      }
      if (files.gstCertificate) {
        urls.gstCertificate = await uploadSingleFile('gstCertificate', files.gstCertificate);
      }
      if (files.businessProof) {
        urls.businessProof = await uploadSingleFile('businessProof', files.businessProof);
      }

      setUploadProgress(90);

      // 2. Submit the registration application
      const payload = {
        businessName: formData.businessName,
        aadhaarNumber: formData.aadhaarNumber,
        panNumber: formData.panNumber,
        gstNumber: formData.gstNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          upiId: formData.upiId
        },
        documents: urls
      };

      const res = await api.post('/manager-applications/apply', payload);
      
      if (res.data.success) {
        setUploadProgress(100);
        setUploading(false);
        setStep(5); // Success state
      }
    } catch (err) {
      setUploading(false);
      setErrorMsg(err.response?.data?.error || 'Failed to submit application. Make sure files are under 5MB.');
    }
  };

  const handleReapply = () => {
    setExistingApp(null);
    setStep(1);
  };

  if (!token) {
    return (
      <div className="pt-44 px-6 max-w-xl mx-auto text-center pb-24 font-body-md text-on-surface relative overflow-hidden">
        {/* Decorative Grid Overlay & Blobs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,17,40,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,17,40,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[32px] shadow-2xl border border-platinum-gray/50 relative card-shadow">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-steward-gold rounded-t-full"></div>
          <AlertCircle className="text-steward-gold mx-auto mb-6 shadow-sm animate-pulse" size={48} />
          <h2 className="text-2xl font-headline-md font-black text-heritage-navy mb-3">Authentication Required</h2>
          <p className="text-on-surface-variant font-body-sm text-xs leading-relaxed mb-8 font-light">You must have an active account to register as a corporate partner. Please sign in or create an account to begin the verification onboarding process.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="flex-1 py-3.5 bg-surface-container border border-platinum-gray hover:bg-surface-container-high text-heritage-navy rounded-xl font-bold font-label-md text-xs uppercase tracking-wider transition cursor-pointer">Sign In</button>
            <button onClick={() => navigate('/register')} className="flex-1 py-3.5 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl font-bold font-label-md text-xs uppercase tracking-wider transition cursor-pointer shadow-md">Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  if (checkingApp) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="w-12 h-12 border-4 border-steward-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Status Panel if they have an application
  if (existingApp) {
    return (
      <div className="pt-44 px-6 max-w-2xl mx-auto pb-24 font-body-md text-on-surface relative overflow-hidden">
        {/* Decorative Grid Overlay & Blobs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,17,40,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,17,40,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[32px] text-center shadow-2xl border border-platinum-gray/50 relative card-shadow">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-steward-gold rounded-t-full"></div>

          {existingApp.status === 'Pending' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-600/10 border border-amber-600/20 text-amber-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-headline-lg font-black text-heritage-navy">Email Verification Required</h2>
              <p className="text-on-surface-variant font-body-sm text-xs leading-relaxed max-w-md mx-auto font-light">
                We have received your partner registration for <strong className="text-heritage-navy font-bold">{existingApp.businessName}</strong>! <br /><br />
                To proceed with property listings, please check your inbox and click the email confirmation link. Once verified, our catalog team will immediately begin document verification.
              </p>
              <div className="flex justify-center gap-3 pt-6">
                <button onClick={checkStatus} className="flex items-center gap-2 px-6 py-3.5 bg-surface-container border border-platinum-gray hover:bg-surface-container-high text-xs font-black uppercase tracking-wider text-heritage-navy rounded-xl transition cursor-pointer">
                  <RefreshCw size={14} className="animate-spin" /> Refresh Status
                </button>
              </div>
            </div>
          )}

          {existingApp.status === 'Under Review' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold flex items-center justify-center mx-auto shadow-sm animate-pulse">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl font-headline-lg font-black text-heritage-navy">Application Under Review</h2>
              <p className="text-on-surface-variant font-body-sm text-xs leading-relaxed max-w-md mx-auto font-light">
                Your partnership details and documents for <strong className="text-heritage-navy font-bold">{existingApp.businessName}</strong> are currently under review by our compliance team. <br /><br />
                We are validating your Aadhaar, PAN, and hotel license registries. We'll update you in-app and via email within 24-48 business hours.
              </p>
              <div className="mt-8 pt-6 border-t border-platinum-gray/30 text-left font-body-sm text-xs space-y-3 text-on-surface-variant max-w-xs mx-auto">
                <div className="flex justify-between items-center"><span className="font-light">Aadhaar Status</span><span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px]">Uploading Done</span></div>
                <div className="flex justify-between items-center"><span className="font-light">PAN Status</span><span className="text-amber-600 font-bold uppercase tracking-wider text-[9px]">Verification Pending</span></div>
                <div className="flex justify-between items-center"><span className="font-light">License Check</span><span className="text-amber-600 font-bold uppercase tracking-wider text-[9px]">Registry Verify</span></div>
              </div>
            </div>
          )}

          {existingApp.status === 'Approved' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-3xl font-headline-lg font-black text-heritage-navy">Congratulations! Approved</h2>
              <p className="text-on-surface-variant font-body-sm text-xs leading-relaxed max-w-md mx-auto font-light">
                Your partner application is approved! Your account is upgraded to a <strong className="text-steward-gold font-bold">Hotel Manager</strong>.
              </p>
              <button 
                onClick={() => navigate('/manager')} 
                className="mt-6 px-8 py-4 bg-heritage-navy hover:bg-primary-container text-linen-white text-xs font-bold rounded-xl transition uppercase tracking-wider shadow-md cursor-pointer font-label-md"
              >
                Go to Manager Console
              </button>
            </div>
          )}

          {existingApp.status === 'Rejected' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 text-error flex items-center justify-center mx-auto shadow-sm">
                <XCircle size={32} />
              </div>
              <h2 className="text-3xl font-headline-lg font-black text-heritage-navy">Application Declined</h2>
              <div className="p-4 bg-error/10 border border-error/20 text-error font-body-sm text-xs rounded-2xl max-w-md mx-auto text-left leading-relaxed font-light shadow-sm">
                <p className="font-bold uppercase tracking-wider text-[9px] mb-1 font-label-sm">Reason for Rejection:</p>
                <p>{existingApp.rejectionReason || 'Documents uploaded were blurry or could not be verified in federal registries.'}</p>
              </div>
              <p className="text-on-surface-variant font-body-sm text-xs leading-relaxed max-w-md mx-auto font-light">
                Please double-check your credentials and submit valid business certificate files to re-apply.
              </p>
              <button 
                onClick={handleReapply}
                className="mt-6 px-8 py-4 bg-heritage-navy hover:bg-primary-container text-linen-white font-label-md text-xs font-bold rounded-xl transition uppercase tracking-wider shadow-md cursor-pointer"
              >
                Re-Apply & Edit details
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="pt-44 px-6 max-w-3xl mx-auto pb-24 min-h-screen bg-surface text-on-surface font-body-md relative overflow-hidden">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,17,40,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,17,40,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-20"></div>

      <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[32px] shadow-2xl border border-platinum-gray/50 relative card-shadow">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-steward-gold rounded-t-full"></div>

        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-steward-gold font-extrabold font-label-sm text-[10px] uppercase tracking-widest mb-3">
              <ShieldCheck size={13} /> Corporate Onboarding Portal
            </div>
            <h1 className="text-3xl font-headline-lg font-black text-heritage-navy mb-2">Become a Hotel Partner</h1>
            <p className="text-on-surface-variant font-body-sm text-xs font-light">Verify your corporate credentials and list properties securely on Majestic Suite.</p>
          </div>
        </div>

        {/* Dynamic Stepper */}
        {step < 4 && (
          <div className="mb-12 relative px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-platinum-gray/30 -z-10 -translate-y-1/2 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-steward-gold -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num} 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black border-4 border-surface transition-all duration-500 ${
                    step === num 
                      ? 'bg-steward-gold text-linen-white shadow-lg scale-110' 
                      : step > num 
                        ? 'bg-steward-gold text-linen-white' 
                        : 'bg-surface-container border border-platinum-gray/50 text-on-surface-variant'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error font-body-sm text-xs rounded-2xl flex items-center gap-2.5 shadow-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={step === 3 ? submitApplication : (e) => { e.preventDefault(); setStep(step + 1); }}>
          
          {/* Step 1: Corporate Details */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 font-body-sm text-xs">
              <h2 className="text-lg font-title-lg font-black text-heritage-navy mb-4">Corporate Basic details</h2>
              <div>
                <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Hotel / Business Name</label>
                <input 
                  type="text" 
                  name="businessName" 
                  value={formData.businessName} 
                  onChange={handleInputChange} 
                  className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" 
                  placeholder="e.g. Royal Palace Suites LLC"
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Aadhaar Card Number</label>
                  <input 
                    type="text" 
                    name="aadhaarNumber" 
                    value={formData.aadhaarNumber} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" 
                    placeholder="12-digit number"
                    maxLength={12}
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">PAN Card Number</label>
                  <input 
                    type="text" 
                    name="panNumber" 
                    value={formData.panNumber} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" 
                    placeholder="10-character code"
                    maxLength={10}
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">GST Identification Number (GSTIN)</label>
                <input 
                  type="text" 
                  name="gstNumber" 
                  value={formData.gstNumber} 
                  onChange={handleInputChange} 
                  className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" 
                  placeholder="15-character GSTIN (Optional)"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Bank details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 font-body-sm text-xs">
              <h2 className="text-lg font-title-lg font-black text-heritage-navy mb-4">Location & Ledger bank details</h2>
              <div>
                <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Business Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray h-24 resize-none leading-relaxed" 
                  placeholder="Full physical office address..."
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                </div>
                <div>
                  <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                </div>
                <div>
                  <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                </div>
              </div>
              
              <div className="border-t border-platinum-gray/30 pt-6 mt-8">
                <h3 className="font-label-sm text-xs font-black text-heritage-navy uppercase tracking-widest mb-4">Bank Ledger (Payout details)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Bank Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Bank IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-label-sm text-on-surface-variant font-black uppercase tracking-widest block mb-2">UPI ID for instant payout</label>
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="w-full bg-surface-bright border border-platinum-gray/50 rounded-2xl p-4 text-sm text-heritage-navy font-semibold outline-none focus:border-steward-gold focus:bg-surface-container-lowest transition-all duration-300 shadow-sm placeholder-platinum-gray" placeholder="e.g. name@upi" required />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Uploads */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 font-body-sm text-xs">
              <h2 className="text-lg font-title-lg font-black text-heritage-navy mb-4">Official Document Verification Files</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Aadhaar */}
                <div className="border border-platinum-gray/50 hover:border-steward-gold rounded-2xl p-6 text-center cursor-pointer relative bg-surface-bright focus-within:border-steward-gold transition-all duration-300 group shadow-sm">
                  <input type="file" name="aadhaarCard" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="w-12 h-12 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="font-body-sm text-xs text-heritage-navy font-bold">Aadhaar Card Scan</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-1.5 truncate max-w-[200px] mx-auto">{files.aadhaarCard ? files.aadhaarCard.name : 'PDF, JPG up to 5MB'}</p>
                </div>

                {/* PAN */}
                <div className="border border-platinum-gray/50 hover:border-steward-gold rounded-2xl p-6 text-center cursor-pointer relative bg-surface-bright focus-within:border-steward-gold transition-all duration-300 group shadow-sm">
                  <input type="file" name="panCard" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="w-12 h-12 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="font-body-sm text-xs text-heritage-navy font-bold">PAN Card Scan</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-1.5 truncate max-w-[200px] mx-auto">{files.panCard ? files.panCard.name : 'PDF, JPG up to 5MB'}</p>
                </div>

                {/* Hotel License */}
                <div className="border border-platinum-gray/50 hover:border-steward-gold rounded-2xl p-6 text-center cursor-pointer relative bg-surface-bright focus-within:border-steward-gold transition-all duration-300 group col-span-1 md:col-span-2 shadow-sm">
                  <input type="file" name="hotelLicense" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="w-12 h-12 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="font-body-sm text-xs text-heritage-navy font-bold">Official Hotel License / Corporate Registry Proof</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-1.5 truncate max-w-[400px] mx-auto">{files.hotelLicense ? files.hotelLicense.name : 'Drag & drop or click to upload PDF/JPG'}</p>
                </div>

                {/* Profile Photo */}
                <div className="border border-platinum-gray/50 hover:border-steward-gold rounded-2xl p-6 text-center cursor-pointer relative bg-surface-bright focus-within:border-steward-gold transition-all duration-300 group shadow-sm">
                  <input type="file" name="profilePhoto" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="w-12 h-12 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="font-body-sm text-xs text-heritage-navy font-bold">Manager Profile Photo</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-1.5 truncate max-w-[200px] mx-auto">{files.profilePhoto ? files.profilePhoto.name : 'Square JPG up to 5MB'}</p>
                </div>

                {/* GST */}
                <div className="border border-platinum-gray/50 hover:border-steward-gold rounded-2xl p-6 text-center cursor-pointer relative bg-surface-bright focus-within:border-steward-gold transition-all duration-300 group shadow-sm">
                  <input type="file" name="gstCertificate" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-12 h-12 rounded-2xl bg-steward-gold/10 border border-steward-gold/20 text-steward-gold mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="font-body-sm text-xs text-heritage-navy font-bold">GST registration Certificate</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-1.5 truncate max-w-[200px] mx-auto">{files.gstCertificate ? files.gstCertificate.name : 'Corporate tax proof (Optional)'}</p>
                </div>

              </div>
            </div>
          )}

          {/* Step 4: Loading & Upload Progress bar */}
          {step === 4 && uploading && (
            <div className="text-center py-12 animate-in fade-in">
              <div className="w-12 h-12 border-4 border-steward-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-xl font-title-lg font-bold text-heritage-navy mb-2">Uploading credentials safely...</h2>
              <p className="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-light">We are generating secure cryptographic file signatures and transferring verification indexes into the Documents collection ledger.</p>
              
              <div className="w-full bg-surface-container h-2.5 rounded-full mt-8 max-w-xs mx-auto overflow-hidden border border-platinum-gray/50">
                <div className="bg-steward-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-steward-gold font-label-md text-xs font-black mt-3">{uploadProgress}% Transfer</p>
            </div>
          )}

          {/* Step 5: Complete Success */}
          {step === 5 && (
            <div className="text-center py-12 animate-in zoom-in duration-300">
              <CheckCircle className="mx-auto text-emerald-600 mb-4 animate-bounce" size={56} />
              <h2 className="text-2xl font-headline-md font-black text-heritage-navy mb-2">Application Submitted!</h2>
              <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed max-w-md mx-auto font-light">
                Thank you! Your partnership registration details have been submitted successfully. <br /><br />
                We have dispatched a verification check to your email inbox. Please click the confirmation link to begin our document validation review.
              </p>
              <button 
                type="button" 
                onClick={() => { checkStatus(); }} 
                className="mt-8 px-8 py-4 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl font-label-md font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Track application status
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="mt-10 flex justify-between pt-6 border-t border-platinum-gray/30">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)} 
                  className="flex items-center gap-2 px-6 py-3.5 bg-surface-container border border-platinum-gray/50 hover:bg-surface-container-high text-heritage-navy rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                className="flex items-center gap-2 px-6 py-3.5 bg-heritage-navy hover:bg-primary-container text-linen-white rounded-xl font-label-md font-bold text-xs uppercase tracking-wider transition shadow-md ml-auto cursor-pointer"
              >
                {step === 3 ? 'Submit Application' : 'Continue'} <ArrowRight size={14} />
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
