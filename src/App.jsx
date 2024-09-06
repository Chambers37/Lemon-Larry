import NavBar from "./components/navbar.jsx"
import RegisterLogin from "./components/loginPage.jsx"
import AboutUsPage from "./components/about-us.jsx"
import { Routes,Route } from "react-router-dom";
import GameScene from '../scripts/game.jsx';
import Chat from "./components/Chat.jsx";

const App = () => {

  return (
    <>
      <NavBar/>
          <Routes>
            <Route exact path="/" element={<RegisterLogin/>}></Route>
            <Route exact path="/Login" element={<RegisterLogin/>}></Route>
            <Route exact path="/Play" element={<GameScene />}></Route>
            <Route exact path="/About-Us" element={<AboutUsPage/>}></Route>
            <Route exact path="/Chat" element={<Chat/>}></Route>
          </Routes>
    </>
  )
}

export default App
