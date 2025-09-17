import { Link } from "react-router-dom"
import '../styles/NavBar.css'
function NavBar()
{
    return <nav className="navbar ">
        <div className="navbar-brand">
            <Link to="/">NammaCity</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/Login" className="nav-link">Login</Link>
            <Link to="/Signup" className="nav-link">Signup</Link>
        </div>
    </nav>
}
export default NavBar