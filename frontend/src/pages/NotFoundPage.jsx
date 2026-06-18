import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page page">
      <div className="not-found__content">
        <div className="not-found__code">404</div>
        <div className="not-found__icon">🎬</div>
        <h1 className="not-found__title">Scene Not Found</h1>
        <p className="not-found__desc">
          Looks like this page took an unexpected intermission. Let's get you back to the show.
        </p>
        <Link to="/" className="btn btn-primary btn-lg" id="back-home-btn">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
