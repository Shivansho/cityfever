import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FieldJobStatus } from '../types/multiRole';
import {
  HardHat,
  MapPin,
  Navigation,
  CheckCircle2,
  Camera,
  Wrench,
  Phone,
  Smartphone,
  Laptop,
  Clock,
  Check,
} from 'lucide-react';

export const FieldWorkerOps: React.FC = () => {
  const {
    fieldJobs,
    updateJobStatus,
    toggleChecklistItem,
    completeJob,
    language,
    showToast,
  } = useApp();

  const [selectedJobId, setSelectedJobId] = useState<string>('JOB-882');
  const [jobFilter, setJobFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile-mock'>('desktop');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const selectedJob = fieldJobs.find((j) => j.id === selectedJobId) || fieldJobs[0];

  const statusSequence: { status: FieldJobStatus; label: string }[] = [
    { status: 'ASSIGNED', label: '1. Assigned' },
    { status: 'EN_ROUTE', label: '2. En Route' },
    { status: 'ON_SITE', label: '3. On Site' },
    { status: 'IN_REPAIR', label: '4. Repairing' },
    { status: 'RESOLVED', label: '5. Resolved' },
  ];

  const filteredJobs = fieldJobs.filter((j) => {
    if (jobFilter === 'ACTIVE') return j.status !== 'RESOLVED';
    if (jobFilter === 'COMPLETED') return j.status === 'RESOLVED';
    return true;
  });

  const handleStatusClick = (newStatus: FieldJobStatus) => {
    if (!selectedJob) return;
    if (newStatus === 'RESOLVED') {
      completeJob(
        selectedJob.id,
        completionNotes || 'Repair executed according to municipal engineering standards.',
        selectedJob.afterPhotoUrl || 'https://images.unsplash.com/photo-1584463623578-3011327c5957?auto=format&fit=crop&w=600&q=80'
      );
    } else {
      updateJobStatus(selectedJob.id, newStatus);
    }
  };

  const handleSimulatePhotoUpload = () => {
    setIsUploadingPhoto(true);
    setTimeout(() => {
      setIsUploadingPhoto(false);
      if (selectedJob) {
        completeJob(
          selectedJob.id,
          'Evidence photo uploaded with GPS watermark verification.',
          'https://images.unsplash.com/photo-1584463623578-3011327c5957?auto=format&fit=crop&w=600&q=80'
        );
      }
      showToast('After-repair evidence photo uploaded successfully!');
    }, 600);
  };

  return (
    <div className="flex-1 bg-[#080D14] text-[#E8EDF3] flex flex-col overflow-y-auto min-h-0">
      {/* ── Top Bar ── */}
      <div className="bg-[#111A24] border-b border-[#263342] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[5px] bg-[#D49A32]/20 border border-[#D49A32]/40 flex items-center justify-center text-[#D49A32]">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-semibold text-[#E8EDF3]">
                {language === 'hi' ? 'फील्ड ऑपरेशन्स कंसोल' : 'Field Operations Console'}
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-[#27A878]/20 text-[#27A878] text-[9px] font-mono border border-[#27A878]/30">
                ON DUTY
              </span>
            </div>
            <div className="text-[10px] text-[#637184] font-mono">
              Crew Unit #04 — Jal Board & Infrastructure
            </div>
          </div>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#0D141D] p-0.5 rounded-[5px] border border-[#263342] text-xs">
            <button
              onClick={() => setJobFilter('ACTIVE')}
              className={`px-3 py-1 rounded-[4px] cursor-pointer font-mono text-[11px] ${
                jobFilter === 'ACTIVE' ? 'bg-[#151F2A] text-[#D49A32]' : 'text-[#637184]'
              }`}
            >
              Active ({fieldJobs.filter((j) => j.status !== 'RESOLVED').length})
            </button>
            <button
              onClick={() => setJobFilter('COMPLETED')}
              className={`px-3 py-1 rounded-[4px] cursor-pointer font-mono text-[11px] ${
                jobFilter === 'COMPLETED' ? 'bg-[#151F2A] text-[#27A878]' : 'text-[#637184]'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex items-center bg-[#0D141D] p-0.5 rounded-[5px] border border-[#263342] text-xs">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-[4px] cursor-pointer ${
                viewMode === 'desktop' ? 'bg-[#151F2A] text-[#E8EDF3]' : 'text-[#637184]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('mobile-mock')}
              className={`p-1.5 rounded-[4px] cursor-pointer ${
                viewMode === 'mobile-mock' ? 'bg-[#151F2A] text-[#E8EDF3]' : 'text-[#637184]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className={`flex-1 p-4 sm:p-6 flex justify-center ${viewMode === 'mobile-mock' ? 'bg-[#080D14] py-8' : ''}`}>
        <div
          className={`w-full ${
            viewMode === 'mobile-mock'
              ? 'max-w-[420px] bg-[#111A24] border border-[#263342] rounded-lg p-4 overflow-y-auto space-y-4'
              : 'max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-5'
          }`}
        >
          {/* Left Column / Work Orders */}
          <div className={viewMode === 'mobile-mock' ? 'space-y-3' : 'lg:col-span-5 space-y-3'}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#E8EDF3]">
                Assigned work orders
              </h2>
              <span className="text-[11px] text-[#637184] font-mono">
                Total: {filteredJobs.length}
              </span>
            </div>

            <div className="space-y-2">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-[#151F2A] border-[#1597D4]'
                        : 'bg-[#111A24] border-[#263342] hover:bg-[#151F2A]/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1597D4] rounded-l-lg" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-[#0D141D] text-[#D49A32] font-mono text-[10px] border border-[#263342]">
                            #{job.id}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              job.severity === 'CRITICAL'
                                ? 'bg-[#D65A5A]/20 text-[#D65A5A] border border-[#D65A5A]/30'
                                : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                            }`}
                          >
                            {job.severity}
                          </span>
                          <span className="text-xs text-[#1597D4] font-mono flex items-center gap-1">
                            <Navigation className="w-3 h-3" /> {job.distanceKm} km
                          </span>
                        </div>

                        <h3 className="text-xs font-medium text-[#E8EDF3]">
                          {job.title}
                        </h3>

                        <p className="text-[11px] text-[#93A1B2] mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#637184]" /> {job.ward}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                            job.status === 'RESOLVED'
                              ? 'bg-[#27A878]/20 text-[#27A878] border border-[#27A878]/30'
                              : 'bg-[#D49A32]/20 text-[#D49A32] border border-[#D49A32]/30'
                          }`}
                        >
                          {job.status.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-[#637184] mt-1 font-mono flex items-center justify-end gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{job.slaDeadline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column / Active Task */}
          {selectedJob && (
            <div className={viewMode === 'mobile-mock' ? 'space-y-4 pt-2 border-t border-[#263342]' : 'lg:col-span-7 space-y-4'}>
              {/* Task Header */}
              <div className="bg-[#111A24] border border-[#263342] rounded-lg p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#151F2A] text-[#D49A32] text-xs font-mono border border-[#263342]">
                        TASK #{selectedJob.id}
                      </span>
                      <span className="text-xs text-[#637184] font-mono">Ticket #{selectedJob.complaintId}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-medium text-[#E8EDF3]">{selectedJob.title}</h2>
                    <p className="text-xs text-[#93A1B2] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D49A32] shrink-0" />
                      <span>{selectedJob.address}</span>
                    </p>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${selectedJob.latitude},${selectedJob.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-[5px] bg-[#1597D4] hover:bg-[#1282B8] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open GPS Route</span>
                  </a>
                </div>

                {selectedJob.citizenContact && (
                  <div className="pt-3 border-t border-[#263342] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#93A1B2] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#27A878]" />
                      Citizen Contact: <strong className="text-[#E8EDF3]">{selectedJob.citizenContact}</strong>
                    </span>
                    <span className="text-[#D49A32]">SLA: {selectedJob.slaDeadline}</span>
                  </div>
                )}
              </div>

              {/* Status Stepper Buttons */}
              <div className="bg-[#111A24] border border-[#263342] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#E8EDF3]">
                    Status transition
                  </h3>
                  <span className="text-xs text-[#1597D4] font-mono">Current: {selectedJob.status}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {statusSequence.map((seq) => {
                    const isCurrent = selectedJob.status === seq.status;
                    return (
                      <button
                        key={seq.status}
                        onClick={() => handleStatusClick(seq.status)}
                        className={`p-2 rounded-[5px] border text-xs font-medium text-center transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#1597D4] text-white border-[#1597D4]'
                            : 'bg-[#151F2A] border-[#263342] text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#1f2c3b]'
                        }`}
                      >
                        <div>{seq.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SOP Checklist & Spares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* SOP Checklist */}
                <div className="bg-[#111A24] border border-[#263342] rounded-lg p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-[#E8EDF3] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#27A878]" />
                    SOP checklist
                  </h3>
                  <div className="space-y-1.5">
                    {selectedJob.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-2.5 p-2 rounded-[5px] bg-[#0D141D] hover:bg-[#151F2A] border border-[#263342] cursor-pointer text-xs transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(selectedJob.id, item.id)}
                          className="mt-0.5 rounded border-[#263342] text-[#1597D4] focus:ring-[#1597D4]"
                        />
                        <span className={item.completed ? 'line-through text-[#637184]' : 'text-[#93A1B2]'}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Spares Required */}
                <div className="bg-[#111A24] border border-[#263342] rounded-lg p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-[#E8EDF3] flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#DE7A38]" />
                    Required rig & parts
                  </h3>
                  <div className="space-y-1.5">
                    {selectedJob.partsRequired.map((part, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-[5px] bg-[#0D141D] border border-[#263342] text-xs text-[#93A1B2] font-mono"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DE7A38]"></span>
                        <span>{part}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Evidence */}
              <div className="bg-[#111A24] border border-[#263342] rounded-lg p-4 space-y-3.5">
                <h3 className="text-xs font-semibold text-[#E8EDF3] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#1597D4]" />
                  Proof of work / Photo verification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#637184] font-mono">BEFORE REPAIR</span>
                    <div className="h-32 rounded-[5px] overflow-hidden border border-[#263342] relative">
                      {selectedJob.beforePhotoUrl ? (
                        <img
                          src={selectedJob.beforePhotoUrl}
                          alt="Before condition"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0D141D] flex items-center justify-center text-xs text-[#637184] font-mono">
                          No initial photo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#637184] font-mono">AFTER REPAIR (EVIDENCE)</span>
                    <div className="h-32 rounded-[5px] overflow-hidden border border-dashed border-[#263342] bg-[#0D141D] flex flex-col items-center justify-center relative">
                      {selectedJob.afterPhotoUrl ? (
                        <img
                          src={selectedJob.afterPhotoUrl}
                          alt="After repair"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <button
                          onClick={handleSimulatePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="flex flex-col items-center text-xs text-[#93A1B2] hover:text-[#E8EDF3] transition-colors cursor-pointer"
                        >
                          <Camera className="w-5 h-5 mb-1 text-[#1597D4]" />
                          <span>{isUploadingPhoto ? 'Uploading...' : 'Attach Completion Photo'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Work Log */}
                <div>
                  <label className="block text-[10px] font-mono text-[#637184] uppercase mb-1">
                    Work notes & remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 300mm pipe sleeve mounted and pressure tested at 6.5 bar."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full bg-[#0D141D] border border-[#263342] rounded-[5px] px-3 py-2 text-xs text-[#E8EDF3] placeholder-[#637184] focus:outline-none focus:border-[#1597D4]"
                  />
                </div>

                {/* Submit */}
                {selectedJob.status !== 'RESOLVED' && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleStatusClick('RESOLVED')}
                      className="w-full py-2.5 rounded-[5px] bg-[#27A878] hover:bg-[#208f65] text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete Work Order & Notify Operations</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
