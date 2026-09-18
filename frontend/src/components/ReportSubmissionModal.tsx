import React, { useState } from 'react';
import { X, Send, CheckCircle, Sparkles, Building } from 'lucide-react';
import { api } from '../services/api';

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (report: any) => void;
}

const DELHI_WARDS = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2195 },
  { name: 'Karol Bagh', lat: 28.6520, lng: 77.1900 },
  { name: 'Lajpat Nagar', lat: 28.5700, lng: 77.2400 },
  { name: 'Rohini Sector 10', lat: 28.7150, lng: 77.1150 },
  { name: 'Dwarka Sector 21', lat: 28.5520, lng: 77.0580 },
  { name: 'Gurugram Cyber Hub', lat: 28.4950, lng: 77.0890 },
  { name: 'Noida Sector 62', lat: 28.6280, lng: 77.3650 },
  { name: 'Chandni Chowk', lat: 28.6560, lng: 77.2300 },
  { name: 'Okhla Industrial Area', lat: 28.5300, lng: 77.2700 },
  { name: 'Laxmi Nagar', lat: 28.6300, lng: 77.2770 }
];

export const ReportSubmissionModal: React.FC<ReportSubmissionModalProps> = ({
  isOpen,
  onClose,
  onReportCreated
}) => {
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(DELHI_WARDS[0].name);
  const [category, setCategory] = useState('auto');
  const [severity, setSeverity] = useState('MEDIUM');
  const [reporterName, setReporterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  const selectedWardObj = DELHI_WARDS.find(w => w.name === ward) || DELHI_WARDS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      // Add slight jitter for realism
      const latJitter = (Math.random() - 0.5) * 0.005;
      const lngJitter = (Math.random() - 0.5) * 0.005;

      const payload = {
        description,
        ward,
        latitude: Number((selectedWardObj.lat + latJitter).toFixed(6)),
        longitude: Number((selectedWardObj.lng + lngJitter).toFixed(6)),
        category: category === 'auto' ? undefined : category,
        severity,
        reporter_name: reporterName.trim() || 'Citizen Reporter'
      };

      const result = await api.submitCitizenReport(payload);
      setSuccessData(result);
      if (onReportCreated) onReportCreated(result);
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D14]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#111A24] border border-[#263342] rounded-lg overflow-hidden flex flex-col text-[#E8EDF3]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263342] bg-[#0D141D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[5px] bg-[#151F2A] border border-[#263342] text-[#1597D4]">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#E8EDF3]">File incident report</h2>
              <p className="text-xs text-[#637184]">Operational ingestion stream • Delhi NCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] text-[#637184] hover:text-[#E8EDF3] hover:bg-[#151F2A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#27A878]/20 border border-[#27A878]/30 text-[#27A878] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#E8EDF3]">Report Ingested & Streamed</h3>
            <p className="text-xs text-[#93A1B2] max-w-md mx-auto">
              Report ID <span className="font-mono text-[#1597D4] font-medium">{successData.id}</span> was ingested and queued into the spatial cluster stream.
            </p>
            <div className="bg-[#151F2A] border border-[#263342] rounded-[5px] p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#93A1B2]">
                <span>Classified category:</span>
                <span className="text-[#27A878] uppercase font-semibold">{successData.category}</span>
              </div>
              <div className="flex justify-between text-[#93A1B2]">
                <span>Confidence:</span>
                <span className="text-[#E8EDF3] font-semibold">{(successData.classification_confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[#93A1B2]">
                <span>Coordinates:</span>
                <span className="text-[#93A1B2]">{successData.latitude}, {successData.longitude}</span>
              </div>
              <div className="flex justify-between text-[#93A1B2]">
                <span>Assigned severity:</span>
                <span className="text-[#D49A32] font-semibold">{successData.severity}</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-5 py-2 bg-[#1597D4] hover:bg-[#1282B8] text-white text-xs font-medium rounded-[5px] transition-colors cursor-pointer"
            >
              Close & Return to Console
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-medium text-[#93A1B2] mb-1.5">
                Issue Description (English / हिन्दी)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Major water pipeline leakage near Connaught Place Block C, road flooded..."
                rows={3}
                required
                minLength={5}
                className="w-full px-3 py-2 bg-[#0D141D] border border-[#263342] rounded-[5px] text-[#E8EDF3] placeholder-[#637184] text-xs focus:outline-none focus:border-[#1597D4] resize-none"
              />
            </div>

            {/* Ward & Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#93A1B2] mb-1.5">
                  Ward / Locality
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D141D] border border-[#263342] rounded-[5px] text-[#E8EDF3] text-xs focus:outline-none focus:border-[#1597D4]"
                >
                  {DELHI_WARDS.map((w) => (
                    <option key={w.name} value={w.name} className="bg-[#0D141D] text-[#E8EDF3]">{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#93A1B2] mb-1.5">
                  Category Mode
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D141D] border border-[#263342] rounded-[5px] text-[#E8EDF3] text-xs focus:outline-none focus:border-[#1597D4]"
                >
                  <option value="auto" className="bg-[#0D141D] text-[#E8EDF3]">Auto-detect domain</option>
                  <option value="streetlight" className="bg-[#0D141D] text-[#E8EDF3]">Streetlight & Power</option>
                  <option value="water" className="bg-[#0D141D] text-[#E8EDF3]">Water Supply</option>
                  <option value="road" className="bg-[#0D141D] text-[#E8EDF3]">Road Damage / Pothole</option>
                  <option value="traffic" className="bg-[#0D141D] text-[#E8EDF3]">Traffic Grid</option>
                  <option value="waste" className="bg-[#0D141D] text-[#E8EDF3]">Solid Waste / Sanitation</option>
                  <option value="safety" className="bg-[#0D141D] text-[#E8EDF3]">Public Safety & CCTV</option>
                  <option value="drainage" className="bg-[#0D141D] text-[#E8EDF3]">Drainage & Sewage</option>
                </select>
              </div>
            </div>

            {/* Severity & Reporter Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#93A1B2] mb-1.5">
                  Reported Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D141D] border border-[#263342] rounded-[5px] text-[#E8EDF3] text-xs focus:outline-none focus:border-[#1597D4]"
                >
                  <option value="LOW" className="bg-[#0D141D] text-[#E8EDF3]">Low (Minor / Cosmetic)</option>
                  <option value="MEDIUM" className="bg-[#0D141D] text-[#E8EDF3]">Medium (Localized issue)</option>
                  <option value="HIGH" className="bg-[#0D141D] text-[#E8EDF3]">High (Major disruption)</option>
                  <option value="CRITICAL" className="bg-[#0D141D] text-[#E8EDF3]">Critical (Arterial / Hazard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#93A1B2] mb-1.5">
                  Citizen Name / Unit
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Optional (e.g. Ward Resident)"
                  className="w-full px-3 py-2 bg-[#0D141D] border border-[#263342] rounded-[5px] text-[#E8EDF3] placeholder-[#637184] text-xs focus:outline-none focus:border-[#1597D4]"
                />
              </div>
            </div>

            {/* Live Ingestion Note */}
            <div className="flex items-center gap-2 p-3 bg-[#151F2A] border border-[#263342] rounded-[5px] text-xs text-[#93A1B2]">
              <Sparkles className="w-4 h-4 text-[#1597D4] shrink-0" />
              <span>
                Incident will be matched against baseline spatial grids and dispatched automatically.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#93A1B2] hover:text-[#E8EDF3] bg-[#151F2A] hover:bg-[#1f2c3b] border border-[#263342] rounded-[5px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-[#1597D4] hover:bg-[#1282B8] rounded-[5px] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Ingesting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Ingest</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
