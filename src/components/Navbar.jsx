import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="navbar-brand">
        <div className="brand-logo">CS</div>

        <div>
          <h2>Carrier Select</h2>
          <span>Transportation Management</span>
        </div>
      </div>

      <div className="nav-links">

        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/shipments">
          Shipments
        </NavLink>

        <NavLink to="/carriers">
          Carriers
        </NavLink>

        <NavLink to="/recommendations">
          Recommendations
        </NavLink>

        <NavLink to="/analytics">
          Analytics
        </NavLink>

        <NavLink to="/profile">
          Profile
        </NavLink>

      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

    </nav>
  );
}

export default Navbar;