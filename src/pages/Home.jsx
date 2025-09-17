import NavBar from "../components/NavBar";
import "../styles/Home.css";

function Home() {
    return (
        <div className="home-container">
            <NavBar />
            <div className="home-content">
                <h1>Welcome to My Home Page</h1>
                <p>This is a simple React home page with a NavBar.</p>
            </div>
        </div>
    );
}

export default Home;
