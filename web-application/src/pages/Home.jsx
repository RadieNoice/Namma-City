import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

function Home() {
  return (
    <>
      <NavBar />
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h1 className="display-4 fw-bold text-primary mb-3">Welcome to NammaCity</h1>
              <p className="lead text-muted mb-4">
                Your platform for reporting and managing community issues.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/Login" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/Signup" className="btn btn-outline-secondary btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;