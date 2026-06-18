import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../api/services';
import toast from 'react-hot-toast';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    document.title = 'My Bookings - CineBook';
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return;

    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId);
      toast.success('Booking cancelled. Refund initiated.');
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const isUpcoming = (booking) => {
    const showDate = new Date(booking.snapshot?.showDate);
    return showDate >= new Date() && booking.status === 'confirmed';
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));

  if (isLoading) {
    return <div className="page spinner-container"><div className="spinner" /></div>;
  }

  return (
    <div className="my-bookings page">
      <div className="container">
        <h1 className="my-bookings__title">🎟️ My Bookings</h1>
        <p className="my-bookings__subtitle">
          {bookings.length === 0
            ? 'No bookings yet. Book your first ticket!'
            : `${bookings.length} total booking${bookings.length > 1 ? 's' : ''}`}
        </p>

        {bookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="bookings-empty__icon">🎬</div>
            <h3>No Bookings Yet</h3>
            <p>Looks like you haven't booked any tickets yet.</p>
            <Link to="/movies" className="btn btn-primary" style={{ marginTop: '20px' }} id="browse-movies-btn">
              Browse Movies
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcomingBookings.length > 0 && (
              <section className="bookings-section">
                <h2 className="bookings-section__title">
                  <span className="bookings-section__dot bookings-section__dot--green" />
                  Upcoming ({upcomingBookings.length})
                </h2>
                <div className="bookings-list">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={handleCancel}
                      isCancelling={cancellingId === booking._id}
                      type="upcoming"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {pastBookings.length > 0 && (
              <section className="bookings-section">
                <h2 className="bookings-section__title">
                  <span className="bookings-section__dot" />
                  Past & Cancelled ({pastBookings.length})
                </h2>
                <div className="bookings-list">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={null}
                      type="past"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Booking Card Sub-Component ─────────────────────────────────────────── */
const BookingCard = ({ booking, onCancel, isCancelling, type }) => {
  const { bookingId, seats, totalPrice, seatType, snapshot, status } = booking;
  const movie = booking.showtime?.movie;

  return (
    <div className={`booking-card booking-card--${status}`} id={`booking-${bookingId}`}>
      <div className="booking-card__poster">
        <img
          src={movie?.poster}
          alt={snapshot.movieTitle}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80x120/16161f/e50914?text=N/A'; }}
        />
      </div>

      <div className="booking-card__info">
        <div className="booking-card__header">
          <h3 className="booking-card__movie">{snapshot.movieTitle}</h3>
          <span className={`badge ${status === 'confirmed' ? 'badge-green' : 'badge-primary'}`}>
            {status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
          </span>
        </div>

        <div className="booking-card__details">
          <span>📍 {snapshot.theaterName}, {snapshot.city}</span>
          <span>📅 {new Date(snapshot.showDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>🕐 {snapshot.showTime}</span>
          <span>🪑 {seats.sort().join(', ')} ({seats.length} seat{seats.length > 1 ? 's' : ''})</span>
          <span>🎭 {snapshot.screenName}</span>
        </div>
      </div>

      <div className="booking-card__right">
        <div className="booking-card__id">
          <p className="booking-card__id-label">Booking ID</p>
          <p className="booking-card__id-value">{bookingId}</p>
        </div>
        <p className="booking-card__price">₹{totalPrice}</p>

        <div className="booking-card__actions">
          <Link to={`/booking/${booking._id}/confirmation`} className="btn btn-ghost btn-sm" id={`view-booking-${booking._id}`}>
            View Ticket
          </Link>
          {type === 'upcoming' && onCancel && (
            <button
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              onClick={() => onCancel(booking._id)}
              disabled={isCancelling}
              id={`cancel-booking-${booking._id}`}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
