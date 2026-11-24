import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { seatService } from '../services/seatService';
import { bookingService } from '../services/bookingService';
import SlotCard from '../components/SlotCard';
import SeatCard from '../components/SeatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import DigitalBookingPass from '../components/DigitalBookingPass';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Armchair,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Ticket,
  MapPin,
  RefreshCw,
  Printer,
  Download,
  Sparkles,
  Timer
} from 'lucide-react';

const BookSlot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Steps: 1 = Date & Time, 2 = Seat Selection, 3 = Review & Confirm, 4 = Digital Pass Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Selections
  const [bookingDate, setBookingDate] = useState(
    location.state?.preselectedDate || todayStr
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('All');

  // Data
  const [slots, setSlots] = useState([]);
  const [seatsData, setSeatsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Fetch slots on mount
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await seatService.getTimeSlots();
        const slotsList = response.results || response.data || response;
        if (Array.isArray(slotsList) && slotsList.length > 0) {
          setSlots(slotsList);

          const preselectedSlotId = location.state?.preselectedSlotId;
          if (preselectedSlotId) {
            const foundSlot = slotsList.find((s) => s.id.toString() === preselectedSlotId.toString());
            if (foundSlot) setSelectedSlot(foundSlot);
          } else {
            setSelectedSlot(slotsList[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [location.state]);

  // Fetch available seats when slot & date chosen
  const fetchAvailableSeats = async () => {
    if (!selectedSlot?.id || !bookingDate) return;
    setLoadingSeats(true);
    setErrorMessage('');
    try {
      const response = await seatService.getAvailableSeats({
        date: bookingDate,
        slot_id: selectedSlot.id,
      });
      if (response.success && response.data) {
        const seats = response.data.seats || [];
        setSeatsData(seats);

        const preselectedSeatId = location.state?.preselectedSeatId;
        if (preselectedSeatId) {
          const match = seats.find((s) => s.id === preselectedSeatId && s.status === 'AVAILABLE');
          if (match) {
            setSelectedSeat(match);
            setCurrentStep(2);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load seats", err);
      setErrorMessage("Failed to load seat availability. Please try again.");
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (selectedSlot?.id && bookingDate) {
      fetchAvailableSeats();
    }
  }, [bookingDate, selectedSlot]);

  const handleNextToSeats = () => {
    if (!selectedSlot) {
      setErrorMessage("Please select a time slot first.");
      return;
    }
    setErrorMessage('');
    setCurrentStep(2);
    if (seatsData.length === 0) {
      fetchAvailableSeats();
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(seat);
    setErrorMessage('');
    setCurrentStep(3);
  };

  const handleConfirmReservation = async () => {
    if (!selectedSeat || !selectedSlot || !bookingDate) {
      setErrorMessage("Missing reservation parameters.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');

    try {
      const response = await bookingService.createBooking({
        seat_id: selectedSeat.id,
        slot_id: selectedSlot.id,
        booking_date: bookingDate,
      });

      if (response.success && response.data) {
        setConfirmedBooking(response.data);
        setCurrentStep(4);
      } else {
        setErrorMessage(response.message || "Reservation failed.");
      }
    } catch (err) {
      const data = err.response?.data;
      let detailedMsg = '';
      if (data?.errors) {
        if (data.errors.non_field_errors?.[0]) detailedMsg = data.errors.non_field_errors[0];
        else if (data.errors.seat_id?.[0]) detailedMsg = data.errors.seat_id[0];
        else if (data.errors.slot_id?.[0]) detailedMsg = data.errors.slot_id[0];
        else if (data.errors.booking_date?.[0]) detailedMsg = data.errors.booking_date[0];
        else {
          const firstVal = Object.values(data.errors)[0];
          detailedMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        }
      }
      const msg = detailedMsg || (data?.message && data.message !== 'Booking validation failed.' ? data.message : 'Reservation rejected. This seat or interval cannot be reserved.');
      setErrorMessage(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const floors = ['All', 'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
  const filteredSeats = selectedFloor === 'All'
    ? seatsData
    : seatsData.filter((s) => s.floor === selectedFloor);
  const availableCount = filteredSeats.filter((s) => s.status === 'AVAILABLE').length;
  const totalCount = filteredSeats.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Wizard Progress Steps */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { step: 1, title: 'Date & Time' },
            { step: 2, title: 'Desk Selection' },
            { step: 3, title: 'Review Order' },
            { step: 4, title: 'Entry QR Pass' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs transition-all ${
                    currentStep === item.step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/25'
                      : currentStep > item.step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${
                  currentStep === item.step ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {item.title}
                </span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          {errorMessage.toLowerCase().includes('already hold') && (
            <Link
              to="/my-bookings"
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition shadow-sm"
            >
              View My Existing Bookings &rarr;
            </Link>
          )}
        </div>
      )}

      {/* STEP 1: DATE & TIME WINDOW SELECTION */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
        >
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Step 1 of 4
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
              Choose Session Date & Time Window
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your intended research date and standardized academic study window.
            </p>
          </div>

          {/* Date Picker Input */}
          <div className="max-w-xs space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Reservation Date
            </label>
            <input
              type="date"
              value={bookingDate}
              min={todayStr}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          {/* Time Slot Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-500" /> Available Library Sessions
            </label>

            {loadingSlots ? (
              <div className="py-8 text-center">
                <LoadingSpinner text="Retrieving library time slot schedule..." />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4">No time slots are currently active.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500">
                          Window
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>}
                      </div>
                      <h4 className="font-display text-sm font-bold leading-tight">
                        {slot.slot_name}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                        {slot.start_time?.slice(0, 5)} &mdash; {slot.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
            <button
              onClick={handleNextToSeats}
              disabled={!selectedSlot}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold transition shadow-md shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98]"
            >
              Continue to Desk Selection <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: PHYSICAL SEAT GRID */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Step 2 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
                Select Your Study Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Session: <strong className="text-slate-800 dark:text-slate-200">{selectedSlot?.slot_name}</strong> on <strong className="text-slate-800 dark:text-slate-200">{bookingDate}</strong>
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Date/Time
            </button>
          </div>

          {/* Floor Tabs & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
              {floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedFloor === fl
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {availableCount}/{totalCount} Available
              </span>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Selected
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          {loadingSeats ? (
            <div className="py-20 text-center">
              <LoadingSpinner text="Checking live desk availability..." />
            </div>
          ) : filteredSeats.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-3">
              <Armchair className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">No desks found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No physical desks found for {selectedFloor !== 'All' ? `floor "${selectedFloor}"` : 'the selected session'}.
              </p>
              <button
                onClick={fetchAvailableSeats}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredSeats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                const isAvail = seat.status === 'AVAILABLE';
                const isReserved = seat.status === 'RESERVED';

                let cardClasses = 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60';

                if (isSelected) {
                  cardClasses = 'bg-blue-600 text-white border-2 border-blue-500 shadow-glow-primary scale-105 cursor-pointer ring-4 ring-blue-500/25';
                } else if (isAvail) {
                  cardClasses = 'bg-emerald-500/5 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-100 border-2 border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/15 cursor-pointer shadow-xs hover:-translate-y-0.5';
                } else if (isReserved) {
                  cardClasses = 'bg-amber-500/5 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300 border-2 border-amber-500/40 cursor-not-allowed opacity-90';
                }

                return (
                  <div
                    key={seat.id}
                    onClick={() => isAvail && handleSeatSelect(seat)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[95px] ${cardClasses}`}
                  >
                    <div className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {seat.seat_type}
                    </div>
                    <div className="font-display text-lg font-extrabold my-1">
                      {seat.seat_number}
                    </div>
                    <div className={`text-[10px] font-mono font-semibold ${isSelected ? 'text-blue-100' : ''}`}>
                      {isSelected ? 'Selected' : isAvail ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 3: REVIEW & CONFIRM */}
      {currentStep === 3 && selectedSeat && selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 max-w-xl mx-auto"
        >
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Step 3 of 4
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
              Review & Finalize Reservation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Confirm your reservation details. A unique cryptographic entry pass will be generated upon confirmation.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Study Desk</span>
              <span className="font-display font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                Seat {selectedSeat.seat_number}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Floor & Zone</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {selectedSeat.floor} &bull; {selectedSeat.section}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Reservation Date</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{bookingDate}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Study Window</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
                {selectedSlot.start_time?.slice(0, 5)} &mdash; {selectedSlot.end_time?.slice(0, 5)} ({selectedSlot.slot_name})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Student Researcher</span>
              <span className="text-slate-900 dark:text-white font-bold">{user?.full_name}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-amber-950 dark:text-amber-100">20-Minute No-Show Auto-Release Policy:</strong> You must check in at the library turnstile within <strong>20 minutes</strong> of session start. If you do not arrive within 20 minutes, your reservation will be automatically cancelled and your seat unlocked and shared with another student.
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Seats
            </button>

            <button
              disabled={bookingLoading}
              onClick={handleConfirmReservation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold transition shadow-md shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98]"
            >
              {bookingLoading ? (
                <span>Confirming in Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-300" /> Confirm & Issue Pass
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION & DIGITAL PASS */}
      {currentStep === 4 && confirmedBooking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              Seat Reservation Successfully Confirmed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your official digital QR pass is ready below. Present it at the physical library entrance turnstile camera upon arrival.
            </p>
          </div>

          {/* Render digital ticket */}
          <div className="max-w-md mx-auto">
            <DigitalBookingPass
              bookingId={confirmedBooking.id}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/my-bookings"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold transition shadow-md shadow-blue-500/25"
            >
              Go to My Reservations
            </Link>
            <button
              onClick={() => {
                setSelectedSeat(null);
                setConfirmedBooking(null);
                setCurrentStep(1);
              }}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Make Another Reservation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BookSlot;