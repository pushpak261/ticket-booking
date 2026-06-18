import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../api/services';
import './BookingConfirmationPage.css';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Booking Confirmed - CineBook';
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getById(id);
      setBooking(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="page spinner-container"><div className="spinner" /></div>;
  }

  if (!booking) {
    return (
      <div className="page spinner-container">
        <div style={{ textAlign: 'center' }}>
          <h2>Booking not found</h2>
          <Link to="/my-bookings" className="btn btn-primary" style={{ marginTop: '16px' }}>
            My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { bookingId, seats, totalPrice, pricePerSeat, seatType, snapshot, status, createdAt } = booking;

  return (
    <div className="confirmation-page page">
      <div className="container">
        {/* ─── Success Banner ─────────────────────────────────────────── */}
        <div className="confirmation-banner">
          <div className="confirmation-banner__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="confirmation-banner__title">Booking Confirmed!</h1>
          <p className="confirmation-banner__desc">
            Your tickets have been booked successfully. Enjoy the show! 🎬
          </p>
        </div>

        {/* ─── Ticket Card ────────────────────────────────────────────── */}
        <div className="ticket-card" id="ticket-card">
          {/* Ticket Header */}
          <div className="ticket-card__header">
            <div>
              <p className="ticket-card__label">BOOKING ID</p>
              <p className="ticket-card__booking-id">{bookingId}</p>
            </div>
            <div className="text-right">
              <p className="ticket-card__label">STATUS</p>
              <span className={`badge ${status === 'confirmed' ? 'badge-green' : 'badge-primary'}`}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Ticket Perforated Line */}
          <div className="ticket-card__perforation">
            <div className="ticket-card__hole ticket-card__hole--left" />
            <div className="ticket-card__dashed" />
            <div className="ticket-card__hole ticket-card__hole--right" />
          </div>

          {/* Ticket Body */}
          <div className="ticket-card__body">
            <div className="ticket-card__movie">
              <div className="ticket-card__poster-wrap">
                <img
                  src={booking.showtime?.movie?.poster}
                  alt={snapshot.movieTitle}
                  className="ticket-card__poster"
                />
              </div>
              <div className="ticket-card__details">
                <h2 className="ticket-card__movie-title">{snapshot.movieTitle}</h2>

                <div className="ticket-card__info-grid">
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">📍 Theater</span>
                    <strong>{snapshot.theaterName}</strong>
                    <span className="ticket-card__sub">{snapshot.city}</span>
                  </div>
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">🎭 Screen</span>
                    <strong>{snapshot.screenName}</strong>
                  </div>
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">📅 Date</span>
                    <strong>
                      {new Date(snapshot.showDate).toLocaleDateString('en-US', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">🕐 Time</span>
                    <strong>{snapshot.showTime}</strong>
                  </div>
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">🪑 Seats</span>
                    <strong>{seats.sort().join(', ')}</strong>
                    <span className="ticket-card__sub">{seats.length} seat(s) • {seatType}</span>
                  </div>
                  <div className="ticket-card__info-item">
                    <span className="ticket-card__label">💰 Total Paid</span>
                    <strong className="ticket-card__price">₹{totalPrice}</strong>
                    <span className="ticket-card__sub">{seats.length} × ₹{pricePerSeat}</span>
                  </div>
                </div>

                <p className="ticket-card__booked-at">
                  Booked on: {new Date(createdAt).toLocaleString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Actions ────────────────────────────────────────────────── */}
        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn btn-ghost" id="view-all-bookings-btn">
            📋 View All Bookings
          </Link>
          <Link to="/movies" className="btn btn-primary" id="book-more-btn">
            🎬 Book More Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
