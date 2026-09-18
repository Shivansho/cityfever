import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { IncidentCategory, SeverityLevel } from '../types/incident';
import type { ComplaintStatus } from '../types/multiRole';
import {
  Lightbulb,
  Droplets,
  Cone,
  Car,
  Zap,
  Trash2,
  Waves,
  Shield,
  MapPin,
  Camera,
  PlusCircle,
  ThumbsUp,
  Star,
  Smartphone,
  Laptop,
  ArrowRight,
  PhoneCall,
  FileText,
  Award,
  Layers,
  Home,
  Check,
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const {
    complaints,
    addComplaint,
    upvoteComplaint,
    rateComplaint,
    userProfile,
    language,
    setCurrentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'complaints' | 'nearby' | 'profile'>('home');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile-mock'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('water');

  // Form states
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLocation, setReportLocation] = useState('Pillar 142, Metro Road, Rohini Sector 7');
  const [reportWard, setReportWard] = useState('Ward 14 — Rohini North');
  const [reportSeverity, setReportSeverity] = useState<SeverityLevel>('HIGH');
  const [reportPhoto, setReportPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintFilter, setComplaintFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>('CP-1024');

  const categories: {
    id: IncidentCategory;
    labelEn: string;
    labelHi: string;
    icon: any;
    dept: string;
    color: string;
    badgeBg: string;
  }[] = [
    {
      id: 'water',
      labelEn: 'Water Supply & Leakage',
      labelHi: 'पानी की आपूर्ति व लीकेज',
      icon: Droplets,
      dept: 'Delhi Jal Board',
      color: '#1597D4',
      badgeBg: '#1597D420',
    },
    {
      id: 'road',
      labelEn: 'Road Damage & Potholes',
      labelHi: 'सड़क क्षति व गड्ढे',
      icon: Cone,
      dept: 'Public Works Dept',
      color: '#D65A5A',
      badgeBg: '#D65A5A20',
    },
    {
      id: 'streetlight',
      labelEn: 'Streetlight & Lighting',
      labelHi: 'स्ट्रीट लाइट व रोशनी',
      icon: Lightbulb,
      dept: 'MCD Electrical Wing',
      color: '#D49A32',
      badgeBg: '#D49A3220',
    },
    {
      id: 'traffic',
      labelEn: 'Traffic & Signal Failure',
      labelHi: 'ट्रैफिक जाम व सिग्नल',
      icon: Car,
      dept: 'Delhi Traffic Police',
      color: '#DE7A38',
      badgeBg: '#DE7A3820',
    },
    {
      id: 'safety',
      labelEn: 'Power & Cable Outage',
      labelHi: 'बिजली ब्रेकडाउन / केबल',
      icon: Zap,
      dept: 'DISCOM / BSES',
      color: '#7E8CE0',
      badgeBg: '#7E8CE020',
    },
    {
      id: 'waste',
      labelEn: 'Solid Waste & Garbage',
      labelHi: 'ठोस अपशिष्ट व कचरा',
      icon: Trash2,
      dept: 'MCD Sanitation',
      color: '#27A878',
      badgeBg: '#27A87820',
    },
    {
      id: 'water',
      labelEn: 'Drainage & Sewage Block',
      labelHi: 'सीवेज व नाली अवरोध',
      icon: Waves,
      dept: 'Drainage Division',
      color: '#1597D4',
      badgeBg: '#1597D420',
    },
    {
      id: 'safety',
      labelEn: 'Public Safety Hazard',
      labelHi: 'सार्वजनिक सुरक्षा खतरा',
      icon: Shield,
      dept: 'Municipal Enforcement',
      color: '#7E8CE0',
      badgeBg: '#7E8CE020',
    },
  ];

  const handleStartReportFromCategory = (cat: IncidentCategory) => {
    setSelectedCategory(cat);
    setActiveTab('report');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const created = addComplaint({
        category: selectedCategory,
        title: reportTitle,
        description: reportDescription || `${selectedCategory} issue reported at ${reportLocation}`,
        location: reportLocation,
        ward: reportWard,
        latitude: 28.6328 + (Math.random() - 0.5) * 0.05,
        longitude: 77.2197 + (Math.random() - 0.5) * 0.05,
        photoUrl: reportPhoto || undefined,
        severity: reportSeverity,
        status: 'REPORTED',
      });

      setIsSubmitting(false);
      setReportTitle('');
      setReportDescription('');
      setExpandedComplaintId(created.id);
      setActiveTab('complaints');
    }, 500);
  };

  const statusProgressSteps: { key: ComplaintStatus; label: string }[] = [
    { key: 'REPORTED', label: 'Reported' },
    { key: 'ACKNOWLEDGED', label: 'Verified' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepIndex = (s: ComplaintStatus) => {
    switch (s) {
      case 'REPORTED': return 0;
      case 'ACKNOWLEDGED': return 1;
      case 'ASSIGNED': return 2;
      case 'IN_PROGRESS': return 3;
      case 'RESOLVED':
      case 'VERIFIED': return 4;
      default: return 0;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === 'ACTIVE') return c.status !== 'RESOLVED' && c.status !== 'VERIFIED';
    if (complaintFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'VERIFIED';
    return true;
  });

  return (
    <div className="flex-1 bg-[#080D14] text-[#E8EDF3] flex flex-col overflow-y-auto min-h-0">
      {/* ── Sub Navigation Tabs ── */}
      <div className="bg-[#111A24] border-b border-[#263342] px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#151F2A] text-[#1597D4] border border-[#263342]'
                : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'होम' : 'Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-[#1597D4] text-white'
                : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'शिकायत दर्ज करें' : 'File Complaint'}</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'bg-[#151F2A] text-[#1597D4] border border-[#263342]'
                : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मेरी शिकायतें' : 'My Complaints'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#151F2A] text-[10px] text-[#93A1B2] font-mono border border-[#263342]">
              {complaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'nearby'
                ? 'bg-[#151F2A] text-[#1597D4] border border-[#263342]'
                : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'आस-पास का फीड' : 'Nearby Feed'}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#151F2A] text-[#1597D4] border border-[#263342]'
                : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#0D141D] p-0.5 rounded-[5px] border border-[#263342] text-xs">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 cursor-pointer font-mono text-[11px] ${
              viewMode === 'desktop' ? 'bg-[#151F2A] text-[#E8EDF3]' : 'text-[#637184]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('mobile-mock')}
            className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 cursor-pointer font-mono text-[11px] ${
              viewMode === 'mobile-mock' ? 'bg-[#151F2A] text-[#E8EDF3]' : 'text-[#637184]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile Frame</span>
          </button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className={`flex-1 flex justify-center p-4 sm:p-6 ${viewMode === 'mobile-mock' ? 'bg-[#080D14] py-8' : ''}`}>
        <div
          className={`w-full ${
            viewMode === 'mobile-mock'
              ? 'max-w-[420px] bg-[#111A24] border border-[#263342] rounded-lg p-4 overflow-y-auto space-y-4'
              : 'max-w-5xl space-y-6'
          }`}
        >
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Header Overview Banner */}
              <div className="bg-[#111A24] border border-[#263342] rounded-lg p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#1597D4] text-xs font-mono mb-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{userProfile.ward}</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3]">
                      {language === 'hi' ? `नमस्ते, ${userProfile.name}` : `Welcome, ${userProfile.name}`}
                    </h1>
                    <p className="text-[#93A1B2] text-xs sm:text-sm mt-1">
                      {language === 'hi'
                        ? 'अपनी नागरिक शिकायतें दर्ज करें और 24/7 स्थिति ट्रैक करें।'
                        : 'Submit and track municipal grievances with real-time status updates.'}
                    </p>
                  </div>

                  <div className="bg-[#151F2A] border border-[#263342] rounded-lg p-3.5 sm:text-right shrink-0">
                    <div className="text-[10px] text-[#637184] font-mono">CIVIC KARMA</div>
                    <div className="text-xl font-mono font-bold text-[#1597D4]">
                      {userProfile.karmaPoints} PTS
                    </div>
                    <div className="text-[11px] text-[#93A1B2] mt-0.5">
                      {userProfile.badge}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#263342] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#93A1B2]">
                    <PhoneCall className="w-3.5 h-3.5 text-[#637184]" />
                    <span>
                      Helpline: <strong className="text-[#E8EDF3] font-mono">155304</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('report')}
                    className="px-3.5 py-1.5 bg-[#1597D4] hover:bg-[#1282B8] text-white font-medium rounded-[5px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>File Grievance (+25 Karma)</span>
                  </button>
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-[#E8EDF3] tracking-wide">
                    {language === 'hi' ? 'समस्या की श्रेणी चुनें' : 'Problem Categories'}
                  </h2>
                  <span className="text-[11px] text-[#637184] font-mono">8 Municipal Domains</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleStartReportFromCategory(cat.id)}
                        className="p-4 bg-[#111A24] border border-[#263342] rounded-lg cursor-pointer hover:bg-[#151F2A] hover:border-[#3b4b5e] flex flex-col justify-between transition-colors relative"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-8 h-8 rounded-[5px] flex items-center justify-center"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] text-[#637184] font-mono">
                            {cat.dept.split(' ')[0]}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-xs text-[#E8EDF3]">
                            {language === 'hi' ? cat.labelHi : cat.labelEn}
                          </h3>
                          <div
                            className="text-[11px] font-mono flex items-center gap-1 mt-1.5"
                            style={{ color: cat.color }}
                          >
                            <span>File report</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Reports Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-[#E8EDF3] tracking-wide">
                    {language === 'hi' ? 'सक्रिय शिकायतें' : 'Active Grievances'}
                  </h2>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs text-[#1597D4] hover:underline font-mono"
                  >
                    View all ({complaints.length})
                  </button>
                </div>

                {complaints.slice(0, 2).map((c) => {
                  const stepIdx = getStepIndex(c.status);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setExpandedComplaintId(c.id);
                        setActiveTab('complaints');
                      }}
                      className="p-4 bg-[#111A24] border border-[#263342] rounded-lg cursor-pointer hover:bg-[#151F2A] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-[#151F2A] text-[#1597D4] font-mono text-[10px] border border-[#263342]">
                              #{c.id}
                            </span>
                            <span className="text-xs text-[#637184] font-mono">{c.reportedAt}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              c.severity === 'CRITICAL' ? 'bg-[#D65A5A]/20 text-[#D65A5A] border border-[#D65A5A]/30' : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                            }`}>
                              {c.severity}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-[#E8EDF3]">
                            {c.title}
                          </h3>
                          <p className="text-xs text-[#93A1B2] mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#637184]" />
                            <span>{c.location}</span>
                          </p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono shrink-0 ${
                          c.status === 'RESOLVED' || c.status === 'VERIFIED'
                            ? 'bg-[#27A878]/20 text-[#27A878] border border-[#27A878]/30'
                            : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Step milestone */}
                      <div className="mt-4 pt-3.5 border-t border-[#263342]">
                        <div className="flex items-center justify-between relative px-2">
                          <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-[#263342] -translate-y-1/2 z-0"></div>
                          {statusProgressSteps.map((step, idx) => {
                            const isDone = idx <= stepIdx;
                            return (
                              <div key={step.key} className="flex flex-col items-center z-10">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                                    isDone
                                      ? 'bg-[#1597D4] text-white'
                                      : 'bg-[#151F2A] text-[#637184] border border-[#263342]'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[10px] mt-1 font-mono ${isDone ? 'text-[#1597D4]' : 'text-[#637184]'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REPORT COMPLAINT */}
          {activeTab === 'report' && (
            <div className="p-5 sm:p-6 bg-[#111A24] border border-[#263342] rounded-lg space-y-5">
              <div className="border-b border-[#263342] pb-3.5">
                <h2 className="text-sm font-semibold text-[#E8EDF3] flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#1597D4]" />
                  <span>{language === 'hi' ? 'नई शिकायत दर्ज करें' : 'File a Grievance'}</span>
                </h2>
                <p className="text-xs text-[#93A1B2] mt-1">
                  Your report will be automatically dispatched to the respective municipal division.
                </p>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-2">
                    1. Select Domain *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((c, idx) => {
                      const Icon = c.icon;
                      const isSelected = selectedCategory === c.id;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCategory(c.id)}
                          className={`p-2.5 rounded-[5px] border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#1597D4] text-white border-[#1597D4]'
                              : 'bg-[#151F2A] border-[#263342] text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/80'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate">{language === 'hi' ? c.labelHi : c.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Problem Summary */}
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                    2. Problem Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major water pipe leakage causing flooding on road"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-[#0D141D] border border-[#263342] rounded-[5px] px-3.5 py-2 text-xs text-[#E8EDF3] placeholder-[#637184] focus:outline-none focus:border-[#1597D4]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                    3. Description (English or हिन्दी)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional details regarding duration, landmark, or severity..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full bg-[#0D141D] border border-[#263342] rounded-[5px] p-3 text-xs text-[#E8EDF3] placeholder-[#637184] focus:outline-none focus:border-[#1597D4] resize-none"
                  ></textarea>
                </div>

                {/* Location & Ward */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                      4. Location / Landmark
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={reportLocation}
                        onChange={(e) => setReportLocation(e.target.value)}
                        className="w-full bg-[#0D141D] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-[#E8EDF3] focus:outline-none focus:border-[#1597D4]"
                      />
                      <MapPin className="w-3.5 h-3.5 text-[#1597D4] absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                      Ward / District
                    </label>
                    <select
                      value={reportWard}
                      onChange={(e) => setReportWard(e.target.value)}
                      className="w-full bg-[#0D141D] border border-[#263342] rounded-[5px] px-3 py-2 text-xs text-[#E8EDF3] focus:outline-none focus:border-[#1597D4]"
                    >
                      <option value="Ward 14 — Rohini North" className="bg-[#0D141D] text-[#E8EDF3]">Ward 14 — Rohini North</option>
                      <option value="Ward 42 — Connaught Place" className="bg-[#0D141D] text-[#E8EDF3]">Ward 42 — Connaught Place</option>
                      <option value="Ward 28 — Lajpat Nagar" className="bg-[#0D141D] text-[#E8EDF3]">Ward 28 — Lajpat Nagar</option>
                      <option value="Ward 19 — East Delhi Central" className="bg-[#0D141D] text-[#E8EDF3]">Ward 19 — East Delhi Central</option>
                      <option value="Ward 33 — Janakpuri West" className="bg-[#0D141D] text-[#E8EDF3]">Ward 33 — Janakpuri West</option>
                    </select>
                  </div>
                </div>

                {/* Photo Upload Preview */}
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                    5. Photo Evidence
                  </label>
                  <div className="flex items-center gap-3">
                    {reportPhoto ? (
                      <div className="relative w-24 h-20 rounded-[5px] overflow-hidden border border-[#263342]">
                        <img src={reportPhoto} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReportPhoto(null)}
                          className="absolute inset-0 bg-[#080D14]/80 flex items-center justify-center text-[10px] text-[#E8EDF3] font-mono cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setReportPhoto('https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80')
                        }
                        className="h-12 px-4 rounded-[5px] border border-dashed border-[#263342] hover:border-[#1597D4] bg-[#0D141D] flex items-center gap-2 text-[#93A1B2] text-xs cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#1597D4]" />
                        <span>Attach Photo</span>
                      </button>
                    )}
                    <span className="text-xs text-[#637184]">
                      Attaching a photo helps rapid triage by municipal engineers.
                    </span>
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1.5">
                    6. Priority / Severity
                  </label>
                  <div className="flex items-center gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setReportSeverity(sev)}
                        className={`px-3 py-1.5 rounded-[5px] text-xs font-mono cursor-pointer transition-colors ${
                          reportSeverity === sev
                            ? sev === 'CRITICAL'
                              ? 'bg-[#D65A5A] text-white'
                              : sev === 'HIGH'
                              ? 'bg-[#D49A32] text-white'
                              : 'bg-[#1597D4] text-white'
                            : 'bg-[#151F2A] text-[#93A1B2] hover:text-[#E8EDF3] border border-[#263342]'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-[5px] bg-[#1597D4] hover:bg-[#1282B8] text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Grievance...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Official Grievance (+25 Karma)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MY COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#263342] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#E8EDF3]">
                    {language === 'hi' ? 'मेरी दर्ज शिकायतें' : 'Registered Complaints'}
                  </h2>
                  <p className="text-xs text-[#637184]">Track real-time status and municipal team actions.</p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 bg-[#0D141D] p-0.5 rounded-[5px] border border-[#263342] text-xs">
                  <button
                    onClick={() => setComplaintFilter('ALL')}
                    className={`px-2.5 py-1 rounded-[4px] cursor-pointer font-mono text-[11px] ${
                      complaintFilter === 'ALL' ? 'bg-[#151F2A] text-[#E8EDF3]' : 'text-[#637184]'
                    }`}
                  >
                    All ({complaints.length})
                  </button>
                  <button
                    onClick={() => setComplaintFilter('ACTIVE')}
                    className={`px-2.5 py-1 rounded-[4px] cursor-pointer font-mono text-[11px] ${
                      complaintFilter === 'ACTIVE' ? 'bg-[#151F2A] text-[#D49A32]' : 'text-[#637184]'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setComplaintFilter('RESOLVED')}
                    className={`px-2.5 py-1 rounded-[4px] cursor-pointer font-mono text-[11px] ${
                      complaintFilter === 'RESOLVED' ? 'bg-[#151F2A] text-[#27A878]' : 'text-[#637184]'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Complaints List */}
              <div className="space-y-3">
                {filteredComplaints.map((c) => {
                  const isExpanded = expandedComplaintId === c.id;
                  const stepIdx = getStepIndex(c.status);

                  return (
                    <div
                      key={c.id}
                      className={`p-4 bg-[#111A24] border rounded-lg transition-colors ${
                        isExpanded ? 'border-[#1597D4]' : 'border-[#263342] hover:border-[#3b4b5e]'
                      }`}
                    >
                      <div
                        onClick={() => setExpandedComplaintId(isExpanded ? null : c.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-[#151F2A] text-[#1597D4] text-xs font-mono border border-[#263342]">
                              #{c.id}
                            </span>
                            <span className="text-xs text-[#637184] font-mono">{c.reportedAt}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[#151F2A] text-[#93A1B2] font-mono capitalize border border-[#263342]">
                              {c.category}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-[#E8EDF3]">
                            {c.title}
                          </h3>
                          <div className="text-xs text-[#93A1B2] mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#637184]" />
                            <span>{c.location}</span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-mono ${
                              c.status === 'RESOLVED' || c.status === 'VERIFIED'
                                ? 'bg-[#27A878]/20 text-[#27A878] border border-[#27A878]/30'
                                : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#637184]">
                            {c.assignedDept || 'Under Review'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#263342] space-y-4">
                          {/* Progress Stepper */}
                          <div className="bg-[#0D141D] p-3.5 rounded-[5px] border border-[#263342]">
                            <div className="text-[10px] font-mono text-[#637184] uppercase mb-2.5">
                              Status Progression Tracker
                            </div>
                            <div className="flex items-center justify-between relative px-2">
                              <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-[#263342] -translate-y-1/2 z-0"></div>
                              {statusProgressSteps.map((step, idx) => {
                                const isDone = idx <= stepIdx;
                                return (
                                  <div key={step.key} className="flex flex-col items-center z-10">
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                                        isDone
                                          ? 'bg-[#1597D4] text-white'
                                          : 'bg-[#151F2A] text-[#637184] border border-[#263342]'
                                      }`}
                                    >
                                      {isDone ? '✓' : idx + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] mt-1 font-mono ${
                                        isDone ? 'text-[#1597D4]' : 'text-[#637184]'
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Crew & Upvotes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-[#0D141D] p-3 rounded-[5px] border border-[#263342]">
                              <span className="text-[#637184] block text-[10px] font-mono">Assigned Field Unit</span>
                              <strong className="text-[#E8EDF3] font-medium">{c.assignedCrew || 'Awaiting Dispatch'}</strong>
                            </div>

                            <div className="bg-[#0D141D] p-3 rounded-[5px] border border-[#263342] flex items-center justify-between">
                              <div>
                                <span className="text-[#637184] block text-[10px] font-mono">Community Confirmations</span>
                                <span className="text-[#E8EDF3] font-mono font-medium">{c.upvotes} Citizens</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  upvoteComplaint(c.id);
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-medium cursor-pointer transition-colors ${
                                  c.hasUpvoted ? 'bg-[#1597D4] text-white' : 'bg-[#151F2A] text-[#93A1B2] hover:text-[#E8EDF3] border border-[#263342]'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>+1 Upvote</span>
                              </button>
                            </div>
                          </div>

                          {/* Status Updates */}
                          <div className="bg-[#0D141D] p-3.5 rounded-[5px] border border-[#263342]">
                            <div className="text-[10px] font-mono text-[#637184] uppercase mb-2">
                              Action Log
                            </div>
                            <div className="space-y-2 border-l border-[#263342] pl-3 ml-1.5">
                              {c.statusUpdates.map((u, i) => (
                                <div key={i} className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#E8EDF3]">{u.status}</span>
                                    <span className="text-[#637184] font-mono text-[10px]">{u.timestamp}</span>
                                    <span className="text-[#1597D4] text-[10px] font-mono">({u.actor})</span>
                                  </div>
                                  <p className="text-[#93A1B2] text-xs mt-0.5">{u.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rating if Resolved */}
                          {(c.status === 'RESOLVED' || c.status === 'VERIFIED') && (
                            <div className="bg-[#27A878]/10 border border-[#27A878]/30 p-3.5 rounded-[5px] flex items-center justify-between">
                              <div>
                                <span className="text-xs font-medium text-[#27A878] block">Rate Resolution</span>
                                <span className="text-xs text-[#93A1B2]">Did the crew solve your complaint satisfactorily?</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => rateComplaint(c.id, star)}
                                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        (c.citizenRating || 0) >= star
                                          ? 'text-[#D49A32] fill-[#D49A32]'
                                          : 'text-[#637184]'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: NEARBY FEED */}
          {activeTab === 'nearby' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#263342] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#E8EDF3]">
                    {language === 'hi' ? 'आस-पास की समस्याएं' : 'Nearby Civic Issues (3km)'}
                  </h2>
                  <p className="text-xs text-[#637184]">Upvote existing reports to help authorities prioritize.</p>
                </div>
                <button
                  onClick={() => setCurrentRole('commander')}
                  className="px-3 py-1.5 rounded-[5px] bg-[#151F2A] hover:bg-[#1f2c3b] text-[#1597D4] border border-[#263342] text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span>Open GIS Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 bg-[#111A24] border border-[#263342] rounded-lg space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-[#151F2A] text-[#1597D4] font-mono text-[10px] border border-[#263342]">
                          #{c.id}
                        </span>
                        <h4 className="text-xs font-medium text-[#E8EDF3] mt-1">{c.title}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        c.severity === 'CRITICAL' ? 'bg-[#D65A5A]/20 text-[#D65A5A] border border-[#D65A5A]/30' : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#93A1B2] line-clamp-2">{c.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#263342] text-xs">
                      <span className="text-[#637184] flex items-center gap-1 text-xs font-mono">
                        <MapPin className="w-3 h-3 text-[#637184]" /> {c.ward}
                      </span>
                      <button
                        onClick={() => upvoteComplaint(c.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-mono cursor-pointer transition-colors ${
                          c.hasUpvoted ? 'bg-[#1597D4] text-white' : 'bg-[#151F2A] text-[#93A1B2] hover:text-[#E8EDF3] border border-[#263342]'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>+1 Me Too ({c.upvotes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="p-6 bg-[#111A24] border border-[#263342] rounded-lg text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#151F2A] border border-[#263342] mx-auto flex items-center justify-center text-xl font-bold text-[#1597D4] font-mono">
                  {userProfile.name.charAt(0)}
                </div>

                <div>
                  <h2 className="text-base font-medium text-[#E8EDF3]">{userProfile.name}</h2>
                  <p className="text-xs text-[#1597D4] font-mono">{userProfile.phone}</p>
                  <p className="text-xs text-[#637184] mt-0.5">{userProfile.ward}</p>
                </div>

                <div className="inline-block px-3 py-1 rounded bg-[#151F2A] text-[#93A1B2] border border-[#263342] text-xs">
                  {userProfile.badge}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-[#111A24] border border-[#263342] rounded-lg">
                  <div className="text-xl font-mono font-bold text-[#1597D4]">{userProfile.karmaPoints}</div>
                  <div className="text-[10px] text-[#637184] uppercase font-mono mt-1">Karma Points</div>
                </div>
                <div className="p-4 bg-[#111A24] border border-[#263342] rounded-lg">
                  <div className="text-xl font-mono font-bold text-[#27A878]">{complaints.length}</div>
                  <div className="text-[10px] text-[#637184] uppercase font-mono mt-1">Reports Filed</div>
                </div>
                <div className="p-4 bg-[#111A24] border border-[#263342] rounded-lg">
                  <div className="text-xl font-mono font-bold text-[#D49A32]">{userProfile.resolvedCount}</div>
                  <div className="text-[10px] text-[#637184] uppercase font-mono mt-1">Resolved</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
