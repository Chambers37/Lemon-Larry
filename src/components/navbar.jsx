import { Link } from "react-router-dom";
const NavBar = () => {
  return(
    <nav className="navbar">
      <Link to="/Chat">Chat</Link>
      <Link to="/Play">Play Now</Link>
      <Link to = "/Login">Login</Link>
      <Link to="/About-Us">About Us</Link>
    </nav>
  )
};

export default NavBar
