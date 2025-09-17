import { Link } from "react-router-dom"

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          NammaCity
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link text-white fw-medium">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Login" className="nav-link text-white fw-medium">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Signup" className="btn btn-outline-light ms-2">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
