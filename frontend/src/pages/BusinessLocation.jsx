
function BusinessLocation() {
  const location = "Khubetsoana, Maseru, Lesotho";

  const mapUrl =
    "https://www.google.com/maps?q=Khubetsoana,+Maseru,+Lesotho&output=embed";

  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Khubetsoana%2C+Maseru%2C+Lesotho";

  return (
    <div className="dashboard-content business-location-page">
      <div className="page-heading">
        <div>
          <h2>Business Location</h2>
          <p>
            Find Batloung Farm Distribution System in Maseru, Lesotho.
          </p>
        </div>
      </div>

      <section className="content-card business-details-card">
        <h3>Batloung Farm Distribution System</h3>

        <div className="business-detail">
          <span>Business Name</span>
          <strong>Batloung Farm Distribution System</strong>
        </div>

        <div className="business-detail">
          <span>Location</span>
          <strong>{location}</strong>
        </div>

        <div className="business-detail">
          <span>Country</span>
          <strong>Lesotho</strong>
        </div>

        <p className="location-note">
          The map shows the general Khubetsoana area. It does not indicate
          the exact building or street address of the farm.
        </p>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button directions-button"
        >
          Get Directions
        </a>
      </section>

      <section className="content-card business-map-card">
        <div className="card-heading">
          <div>
            <h3>Our Location on the Map</h3>
            <p>Khubetsoana, Maseru, Lesotho</p>
          </div>
        </div>

        <div className="business-map">
          <iframe
            title="Map of Khubetsoana, Maseru, Lesotho"
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <footer className="footer">
        Batloung Farm Distribution System © 2026
      </footer>
    </div>
  );
}

export default BusinessLocation;
