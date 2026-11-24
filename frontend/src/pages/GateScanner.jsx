import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  QrCode,
  ShieldCheck,
  UserCheck,
  User,
  Clock,
  MapPin,
  Calendar,
  History,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { checkInService } from '../services/checkInService';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const GateScanner = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Scan Outcome State
  const [lastScanResult, setLastScanResult] = useState(null); // { approved, message, data, reason, timestamp }
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Summary Metrics & Recent activity
  const [stats, setStats] = useState({
    total_scans_today: 0,
    approved_today: 0,
    rejected_today: 0,
    approval_rate: 100.0,
    recent_events: []
  });

  // Audio feedback using Web Audio API synthesis
  const playFeedbackAudio = (isApproved) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isApproved) {
        // High, cheerful double tone
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        // Low buzzing rejection tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio autoplay might be blocked
    }
  };

  const loadStats = async () => {
    try {
      const res = await checkInService.getGateStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch gate statistics", err);
    }
  };

  useEffect(() => {
    loadStats();
    // Query available video devices
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setVideoDevices(devices);
        if (devices.length > 0) {
          // Prefer environment/back camera if found
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedDeviceId(backCam ? backCam.deviceId : devices[0].deviceId);
        }
      })
      .catch((err) => {
        console.warn("Could not enumerate video devices", err);
      });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (deviceId = selectedDeviceId) => {
    setCameraError('');
    try {
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      setIsScanning(true);

      await readerRef.current.decodeFromVideoDevice(
        deviceId || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            handleProcessToken(scannedText);
          }
        }
      );
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(err.message || 'Unable to open camera. Check browser permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (e) {}
    }
    setIsScanning(false);
  };

  const handleDeviceChange = (e) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    if (isScanning) {
      stopCamera();
      setTimeout(() => startCamera(newId), 300);
    }
  };

  const handleProcessToken = async (tokenString) => {
    if (verifying || !tokenString) return;
    setVerifying(true);
    setCameraError('');

    try {
      const res = await checkInService.verifyGateCheckIn(tokenString.trim());
      if (res.success) {
        setLastScanResult({
          approved: true,
          message: res.message || "ENTRY APPROVED",
          data: res.data,
          timestamp: new Date().toLocaleTimeString(),
        });
        playFeedbackAudio(true);
      } else {
        setLastScanResult({
          approved: false,
          reason: res.message || "Verification Failed",
          data: res.data,
          timestamp: new Date().toLocaleTimeString(),
        });
        playFeedbackAudio(false);
      }
      loadStats();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.reason || "Verification Rejected";
      setLastScanResult({
        approved: false,
        reason: errMsg,
        data: err.response?.data?.data || null,
        timestamp: new Date().toLocaleTimeString(),
      });
      playFeedbackAudio(false);
      loadStats();
    } finally {
      // Small cooldown to prevent duplicate reads in the same second
      setTimeout(() => {
        setVerifying(false);
      }, 1500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleProcessToken(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-mono uppercase tracking-wider font-bold rounded-full border border-blue-200 dark:border-blue-800">
                Gate Turnstile Operations
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                Staff Authenticated: {user?.full_name} ({user?.role})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Digital Gate Scanner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Scan student QR passes or input credentials to authenticate physical library admittance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute audio feedback' : 'Unmute audio feedback'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Muted'}</span>
            </button>

            <button
              onClick={loadStats}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition shadow-xs"
              title="Refresh gate telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">
              Total Scans Today
            </span>
            <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
              {stats.total_scans_today}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Admitted Entries
            </span>
            <span className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.approved_today}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected Attempts
            </span>
            <span className="text-2xl font-display font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
              {stats.rejected_today}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold block">
              Admittance Rate
            </span>
            <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
              {stats.approval_rate}%
            </span>
          </div>
        </div>

        {/* Main Scanner Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center Column: Camera Viewfinder & Manual Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Camera Viewfinder Box */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Turnstile Optical Reader</h3>
                </div>

                {videoDevices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {videoDevices.map((dev) => (
                      <option key={dev.deviceId} value={dev.deviceId}>
                        {dev.label || `Camera ${dev.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Viewfinder Screen */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />

                {!isScanning && (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Camera Standby</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans">
                        Activate camera to begin scanning student entry passes continuously.
                      </p>
                    </div>
                  </div>
                )}

                {/* Aiming Reticle when active */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-52 h-52 border-2 border-teal-400 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] relative flex items-center justify-center">
                      <div className="w-full h-0.5 bg-teal-400 absolute animate-pulse"></div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-200 bg-slate-900/90 px-3 py-1 rounded-full -bottom-7 absolute border border-teal-400/40">
                        Align QR Pass
                      </span>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {verifying && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center text-white flex-col gap-2 z-10">
                    <LoadingSpinner size="default" text="Verifying pass against MySQL database..." />
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Camera Controls */}
              <div className="flex items-center justify-between pt-1">
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-xs shadow-md shadow-blue-500/25 active:scale-[0.98]"
                  >
                    <Camera className="w-4 h-4" /> Start Camera Reader
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition font-semibold text-xs"
                  >
                    <CameraOff className="w-4 h-4" /> Stop Scanner
                  </button>
                )}

                <span className="text-xs text-slate-400 italic">
                  HTTPS or Localhost required for video stream
                </span>
              </div>
            </div>

            {/* Manual Token Entry Fallback */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">Manual Pass Code or USB Scanner</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                If the camera cannot read the screen or an external barcode gun is attached, enter or scan the credential here:
              </p>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste or type LIBPASS_..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={verifying || !manualToken.trim()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-500/25 active:scale-[0.98]"
                >
                  Verify Code
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Scan Verification Outcome Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700/60">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Verification Result</h3>
                {lastScanResult && (
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {lastScanResult.timestamp}
                  </span>
                )}
              </div>

              {!lastScanResult ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ready For Scan</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Present student pass to camera or submit token to view authorization details.
                  </p>
                </div>
              ) : lastScanResult.approved ? (
                /* APPROVED ENTRY CARD */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 space-y-5"
                >
                  {/* Big Green Banner */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display text-lg font-extrabold text-emerald-900 dark:text-emerald-200 leading-tight">
                        ENTRY APPROVED
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Reservation confirmed & active. Access permitted.
                      </p>
                    </div>
                  </div>

                  {/* Student Details for ID Cross-check */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Student Identification</span>
                      <span className="px-2.5 py-0.5 bg-blue-600 text-white font-mono text-[10px] rounded-full font-bold">
                        {lastScanResult.data?.booking_reference}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-base font-display font-extrabold text-slate-900 dark:text-white">{lastScanResult.data?.student_name}</p>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                        Student ID: <strong className="text-slate-800 dark:text-slate-200">{lastScanResult.data?.student_id_masked}</strong>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Dept: {lastScanResult.data?.student_department}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold block">Desk Assigned</span>
                        <span className="font-display font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                          Seat {lastScanResult.data?.seat_number}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {lastScanResult.data?.floor} ({lastScanResult.data?.section})
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold block">Session Window</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                          {lastScanResult.data?.slot_time}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {lastScanResult.data?.slot_name}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Logged: {lastScanResult.data?.checked_in_at}</span>
                      <span>Gate: {lastScanResult.data?.gate_name}</span>
                    </div>
                  </div>

                  {/* Visual ID cross-check instruction */}
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50 rounded-xl text-xs flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <UserCheck className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="text-[11px]">
                      <strong className="text-blue-700 dark:text-blue-300">Guard Check:</strong> Confirm student matches college photo ID card before allowing entrance.
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* REJECTED ENTRY CARD */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 space-y-4"
                >
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 rounded-2xl flex items-start gap-3">
                    <XCircle className="w-7 h-7 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display text-lg font-extrabold text-rose-900 dark:text-rose-200 leading-tight">
                        ENTRY REJECTED
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1">
                        {lastScanResult.reason}
                      </p>
                    </div>
                  </div>

                  {lastScanResult.data?.booking_reference && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <p className="text-slate-500 dark:text-slate-400">
                        Associated Ref: <strong className="font-mono text-blue-600 dark:text-blue-400">{lastScanResult.data.booking_reference}</strong>
                      </p>
                      {lastScanResult.data.student_name && (
                        <p className="text-slate-500 dark:text-slate-400">
                          Student: <strong className="text-slate-900 dark:text-white">{lastScanResult.data.student_name}</strong>
                        </p>
                      )}
                      {lastScanResult.data.seat_number && (
                        <p className="text-slate-500 dark:text-slate-400">
                          Desk: <strong className="text-slate-900 dark:text-white">{lastScanResult.data.seat_number}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                    Instruct student to check their booking status in the portal or visit the help desk.
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent Scans Feed */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">Recent Gate Audit Feed</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">Today</span>
              </div>

              {stats.recent_events?.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No scans recorded yet today.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recent_events?.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5 truncate mr-2">
                        <div className="flex items-center gap-1.5">
                          {ev.status === 'APPROVED' ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{ev.student_name || 'Scan Attempt'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Seat: {ev.seat_number || 'N/A'} &bull; {ev.scanned_at ? new Date(ev.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          ev.status === 'APPROVED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GateScanner;