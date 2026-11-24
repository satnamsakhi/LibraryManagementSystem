import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seatService } from '../services/seatService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  Filter,
  Layers,
  Armchair,
  CheckCircle,
  Lock,
  Wrench,
  Ban,
  ArrowRight,
  RefreshCw,
  MapPin,
  Tag,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const SeatAvailability = () => {
  const navigate = useNavigate();

  // Filter States
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Data States
  const [slots, setSlots] = useState([]);
  const [seatsData, setSeatsData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Load slots on mount
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await seatService.getTimeSlots();
        const slotsList = response.results || response.data || response;
        if (Array.isArray(slotsList) && slotsList.length > 0) {
          setSlots(slotsList);
          setSelectedSlotId(slotsList[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load time slots", err);
      }
    };
    fetchSlots();
  }, []);

  // Fetch seats whenever filters change
  useEffect(() => {
    const fetchSeatGrid = async () => {
      setLoading(true);
      try {
        const params = {
          date: selectedDate,
          slot_id: selectedSlotId || undefined,
          floor: selectedFloor || undefined,
          section: selectedSection || undefined,
          seat_type: selectedType || undefined,
        };
        const response = await seatService.getAvailableSeats(params);
        if (response.success && response.data) {
          setSeatsData(response.data.seats || []);
          setSummary(response.data.summary);
        }
      } catch (err) {
        console.error("Failed to load seat availability", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchSeatGrid();
    }
  }, [selectedDate, selectedSlotId, selectedFloor, selectedSection, selectedType]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat);
    }
  };

  const handleProceedToBooking = () => {
    if (!selectedSeat) return;
    navigate('/book', {
      state: {
        preselectedDate: selectedDate,
        preselectedSlotId: selectedSlotId,
        preselectedSeatId: selectedSeat.id,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            Real-Time Visual Grid
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Library Floor & Seat Inventory Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect real-time seating availability across all library floors for any academic session date.
          </p>
        </div>

        {selectedSeat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-500 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Selected Desk
              </span>
              <p className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Seat {selectedSeat.seat_number} ({selectedSeat.floor})
              </p>
            </div>
            <button
              onClick={handleProceedToBooking}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition active:scale-[0.98]"
            >
              Reserve Desk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Legend Bar & Stats */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border-2 border-emerald-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/20 border-2 border-amber-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/20 border-2 border-rose-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Occupied / Maint.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-600 border-2 border-blue-600"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Selected</span>
          </div>
        </div>

        {summary && (
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium text-xs">
            <span>Total Desks: <strong className="text-slate-900 dark:text-white font-bold">{summary.total_seats}</strong></span>
            <span>&bull;</span>
            <span>Available: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{summary.available_seats}</strong></span>
            <span>&bull;</span>
            <span>Occupied: <strong className="text-amber-600 dark:text-amber-400 font-bold">{summary.reserved_seats}</strong></span>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Filter className="w-3.5 h-3.5" /> Filter Selection
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-500" /> Time Slot
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slot_name} ({s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Floor
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="">All Floors</option>
              <option value="Ground Floor">Ground Floor</option>
              <option value="First Floor">First Floor</option>
              <option value="Second Floor">Second Floor</option>
              <option value="Third Floor">Third Floor</option>
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-500" /> Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="">All Sections</option>
              <option value="General Reading Hall">General Reading Hall</option>
              <option value="Silent Study Cubicles">Silent Study Cubicles</option>
              <option value="Computer & Research Lab">Computer & Research Lab</option>
              <option value="Collaborative Discussion Hub">Collaborative Discussion Hub</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" /> Desk Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="">All Desk Types</option>
              <option value="REGULAR">Regular Desk</option>
              <option value="COMPUTER">Computer Desk</option>
              <option value="SILENT">Silent Cubicle</option>
              <option value="DISCUSSION">Discussion Pod</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Seats */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-700/80 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="py-24 text-center">
            <LoadingSpinner text="Querying database for live seat availability..." />
          </div>
        ) : seatsData.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Armchair className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
            <p className="text-base font-display font-bold text-slate-900 dark:text-white">No Desks Match Filters</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your floor, section, or desk type selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {seatsData.map((seat) => {
              const isSelected = selectedSeat?.id === seat.id;
              const isAvailable = seat.status === 'AVAILABLE';
              const isReserved = seat.status === 'RESERVED';
              const isMaintenance = seat.status === 'MAINTENANCE';

              let cardClasses = 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60';

              if (isSelected) {
                cardClasses = 'bg-blue-600 text-white border-2 border-blue-500 shadow-glow-primary scale-105 cursor-pointer ring-4 ring-blue-500/25';
              } else if (isAvailable) {
                cardClasses = 'bg-emerald-500/5 dark:bg-emerald-950/25 text-slate-800 dark:text-slate-100 border-2 border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/15 cursor-pointer shadow-xs hover:-translate-y-0.5';
              } else if (isReserved) {
                cardClasses = 'bg-amber-500/5 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300 border-2 border-amber-500/40 cursor-not-allowed opacity-90';
              } else if (isMaintenance) {
                cardClasses = 'bg-rose-500/5 dark:bg-rose-950/20 text-slate-700 dark:text-slate-300 border-2 border-rose-500/40 cursor-not-allowed opacity-85';
              }

              return (
                <div
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between items-center min-h-[95px] ${cardClasses}`}
                >
                  <span className={`text-[9px] uppercase font-mono font-bold tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {seat.seat_type?.slice(0, 7)}
                  </span>
                  <span className="font-display text-base font-extrabold my-1">
                    {seat.seat_number}
                  </span>
                  <span className={`text-[9px] font-mono font-semibold ${isSelected ? 'text-blue-100' : ''}`}>
                    {isSelected ? 'SELECTED' : seat.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatAvailability;