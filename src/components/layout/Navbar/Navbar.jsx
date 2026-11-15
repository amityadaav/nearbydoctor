
// import { useState } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { Menu, X, Plus ,Stethoscope} from "lucide-react";
// import Button from "../../common/Button/Button";
// import "./Navbar.css";

// export const NAV = [
//   ["/find-doctors", "Find Doctors"],
//   ["/specialties", "Specialties"],
//   ["/hospitals", "Hospitals"],
//   ["/book-appointment", "Appointments"],
//   ["/list-your-clinic", "List Your Hospitals"],
//   ["/blood-donation", "Blood Donation"],
//   ["/about", "About"],
// ];

// export default function Navbar() {
//   const [open, setOpen] = useState(false);

//   const closeMenu = () => {
//     setOpen(false);
//   };

//   return (
//     <header className="navbar">
//       <div className="navbar-container">

//         {/* Logo */}
//         <Link to="/" className="logo" onClick={closeMenu}>
//             <div className="brand-icon">
//               <Stethoscope size={20} />
//             </div>

//             <h3>NearBy<span>Doctor</span></h3>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="nav-links">
//           {NAV.map(([to, label]) => (
//             <NavLink
//               key={to}
//               to={to}
//               className={({ isActive }) =>
//                 isActive ? "active" : ""
//               }
//             >
//               {label}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Right Side Actions */}
//         <div className="nav-actions">

//           <Button
//             as={Link}
//             to="/login"
//             className="auth-btn"
//           >
//             Login
//           </Button>

//         </div>

//         {/* Mobile Menu Button */}
//         <button
//           type="button"
//           className="menu-btn"
//           aria-label={open ? "Close menu" : "Open menu"}
//           aria-expanded={open}
//           onClick={() => setOpen((prev) => !prev)}
//         >
//           {open ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile Navigation */}
//       {open && (
//         <nav className="mobile-menu">
//           {NAV.map(([to, label]) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={closeMenu}
//               className={({ isActive }) =>
//                 isActive ? "active" : ""
//               }
//             >
//               {label}
//             </NavLink>
//           ))}

//           <NavLink
//             to="/login"
//             onClick={closeMenu}
//           >
//             Login
//           </NavLink>

//           <NavLink
//             to="/signup"
//             onClick={closeMenu}
//           >
//             Sign Up
//           </NavLink>

//           <Link
//             to="/find-doctors"
//             className="full"
//             onClick={closeMenu}
//           >
//             Find a Doctor
//           </Link>
//         </nav>
//       )}
//     </header>
//   );
// }


import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Stethoscope, LogOut } from "lucide-react";
import Button from "../../common/Button/Button";
import "./Navbar.css";

export const NAV = [
  ["/find-doctors", "Find Doctors"],
  ["/specialties", "Specialties"],
  ["/hospitals", "Hospitals"],
  ["/book-appointment", "Appointments"],
  ["/list-your-clinic", "List Your Hospitals"],
  ["/donate-blood", "Donate Blood"],
  ["/about", "About"],
];

const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const closeMenu = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("authChanged", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("authChanged", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const userName = user?.fullname || user?.name || "";
  const initial = userName.trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    closeMenu();

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          {/* <div className="brand-icon">
            <Stethoscope size={20} />
          </div> */}
          <img
            src="/favicon-32x32.png"
            alt="Nearby Doctor Logo"
            className="brand-icon"
          />

          <h3>
            NearBy<span>Doctor</span>
          </h3>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {user && initial ? (
            <div className="profile-wrapper">
              <button
                type="button"
                className="user-avatar"
                title={userName}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
              >
                {initial}
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <strong>{userName}</strong>
                    <span>{user.email}</span>
                    <small>
                      {user.role?.replaceAll("_", " ")}
                    </small>
                  </div>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              as={Link}
              to="/login"
              className="auth-btn"
              onClick={closeMenu}
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <nav className="mobile-menu">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}

          {user && initial ? (
            <button
              type="button"
              className="mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <NavLink to="/signup" onClick={closeMenu}>
                Sign Up
              </NavLink>
            </>
          )}

          <Link
            to="/find-doctors"
            className="full"
            onClick={closeMenu}
          >
            Find a Doctor
          </Link>
        </nav>
      )}
    </header>
  );
}
