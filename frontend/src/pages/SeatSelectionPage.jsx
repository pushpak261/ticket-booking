import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimeService, bookingService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './SeatSelectionPage.css';

/**
 * Seat categories:
 *   Rows A–C  → Recliner (top)
 *   Rows D–F  → Premium
 *   Rows G–J  → Regular
 */
const getSeatType = (row) => {
  const rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
  if (rowIndex <= 2) return 'recliner';
  if (rowIndex <= 5) return 'premium';
  return 'regular';
};

const SeatSelectionPage = () => {
  const { id: showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    document.title = 'Select Seats - CineBook';
    fetchShowtime();
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      const res = await showtimeService.getById(showtimeId);
      setShowtime(res.data.data);
    } catch (err) {
      toast.error('Failed to load showtime.');
      navigate('/movies');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="page spinner-container"><div className="spinner" /></div>;
  }

  if (!showtime) return null;

  const { movie, theater, screenNumber, price, bookedSeats, totalSeats } = showtime;
  const screen = theater.screens.find((s) => s.screenNumber === screenNumber);
  const rows = screen?.rows || 8;
  const cols = screen?.columns || 8;

  // Generate seat labels: A1, A2, ... J8
  const seatRows = Array.from({ length: rows }, (_, i) =>
    String.fromCharCode('A'.charCodeAt(0) + i)
  );

  const getSeatLabel = (row, col) => `${row}${col}`;

  const isSeatBooked = (label) => bookedSeats.includes(label);
  const isSeatSelected = (label) => selectedSeats.includes(label);

  const toggleSeat = (label) => {
    if (isSeatBooked(label)) return;
    if (isSeatSelected(label)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== label));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Maximum 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, label]);
    }
  };

  // Determine dominant seat type for pricing
  const getDominantSeatType = () => {
    if (selectedSeats.length === 0) return 'regular';
    const types = selectedSeats.map((s) => getSeatType(s[0]));
    if (types.includes('recliner')) return 'recliner';
    if (types.includes('premium')) return 'premium';
    return 'regular';
  };

  const seatType = getDominantSeatType();
  const pricePerSeat = price[seatType];
  const totalPrice = pricePerSeat * selectedSeats.length;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    setIsBooking(true);
    try {
      const res = await bookingService.create({
        showtimeId,
        seats: selectedSeats,
        seatType,
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/booking/${res.data.data._id}/confirmation`);
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="seat-page page">
      <div className="container">
        {/* ─── Header Info ─────────────────────────────────────────────── */}
        <div className="seat-page__header">
          <div>
            <h1 className="seat-page__title">{movie.title}</h1>
            <p className="seat-page__subtitle">
              📍 {theater.name} &nbsp;•&nbsp; Screen {screenNumber} &nbsp;•&nbsp;
              📅 {new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              &nbsp;•&nbsp; 🕐 {showtime.startTime}
            </p>
          </div>
        </div>

        {/* ─── Screen Indicator ─────────────────────────────────────────── */}
        <div className="screen-indicator">
          <div className="screen-indicator__screen">
            <span>SCREEN</span>
          </div>
          <div className="screen-indicator__curve" />
        </div>

        {/* ─── Seat Map ─────────────────────────────────────────────────── */}
        <div className="seat-map" role="grid" aria-label="Seat selection map">
          {seatRows.map((row) => {
            const type = getSeatType(row);
            return (
              <div key={row} className="seat-row">
                <span className="seat-row__label">{row}</span>
                <div className="seat-row__seats">
                  {Array.from({ length: cols }, (_, colIdx) => {
                    const label = getSeatLabel(row, colIdx + 1);
                    const booked = isSeatBooked(label);
                    const selected = isSeatSelected(label);
                    return (
                      <button
                        key={label}
                        className={`seat seat--${type} ${booked ? 'seat--booked' : ''} ${selected ? 'seat--selected' : ''}`}
                        onClick={() => toggleSeat(label)}
                        disabled={booked}
                        aria-label={`Seat ${label} ${booked ? '(booked)' : selected ? '(selected)' : '(available)'}`}
                        id={`seat-${label}`}
                        title={label}
                      >
                        {colIdx + 1}
                      </button>
                    );
                  })}
                </div>
                <span className="seat-row__price">₹{price[type]}</span>
              </div>
            );
          })}
        </div>

        {/* ─── Legend ────────────────────────────────────────────────────── */}
        <div className="seat-legend">
          <div className="seat-legend__item">
            <div className="seat seat--regular seat--demo" />
            <span>Regular (₹{price.regular})</span>
          </div>
          <div className="seat-legend__item">
            <div className="seat seat--premium seat--demo" />
            <span>Premium (₹{price.premium})</span>
          </div>
          <div className="seat-legend__item">
            <div className="seat seat--recliner seat--demo" />
            <span>Recliner (₹{price.recliner})</span>
          </div>
          <div className="seat-legend__item">
            <div className="seat seat--selected seat--demo" />
            <span>Selected</span>
          </div>
          <div className="seat-legend__item">
            <div className="seat seat--booked seat--demo" />
            <span>Booked</span>
          </div>
        </div>

        {/* ─── Booking Summary ──────────────────────────────────────────── */}
        <div className="booking-summary">
          <div className="booking-summary__info">
            {selectedSeats.length === 0 ? (
              <p className="booking-summary__hint">Select seats from the map above</p>
            ) : (
              <>
                <p className="booking-summary__seats">
                  Seats: <strong>{selectedSeats.sort().join(', ')}</strong>
                </p>
                <p className="booking-summary__type">
                  Type: <strong style={{ textTransform: 'capitalize' }}>{seatType}</strong>
                  &nbsp;•&nbsp; {selectedSeats.length} × ₹{pricePerSeat}
                </p>
              </>
            )}
          </div>
          <div className="booking-summary__right">
            {selectedSeats.length > 0 && (
              <p className="booking-summary__total">Total: <strong>₹{totalPrice}</strong></p>
            )}
            <button
              className="btn btn-primary btn-lg"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || isBooking}
              id="confirm-booking-btn"
            >
              {isBooking ? (
                <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Booking...</>
              ) : (
                `Confirm ${selectedSeats.length > 0 ? `(${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''})` : 'Booking'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
