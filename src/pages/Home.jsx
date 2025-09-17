import NavBar from "../components/NavBar";
import "../styles/Home.css";

function Home() {
    return (
        <div className="home-container">
            <NavBar />
            <div className="home-content">
                <h1>Welcome to Urban Issue Reporter</h1>
                <p>
                    Our app makes it easy for citizens to report local issues like potholes, broken streetlights, 
                    or sanitation problems in just a few taps.
                </p>
                <ul>
                    <li>📱 Mobile App: Report issues quickly on Android or iOS.</li>
                    <li>🖥️ Admin Dashboard: City officials can track and resolve issues efficiently.</li>
                    <li>⚡ Automated Reporting: Issues are automatically sent to the right department.</li>
                    <li>🔔 Feedback Loop: Stay updated on your reported issues from dispatch to resolution.</li>
                </ul>
                <p>
                    Join us in making our city cleaner, safer, and more connected!
                </p>
            </div>
        </div>
    );
}

export default Home;
