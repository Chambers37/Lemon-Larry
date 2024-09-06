
import { io } from "socket.io-client"
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const socket = io.connect("http://localhost:3001");

const Chat = () => {
  const [messageReceived,setMessageReceived] = useState([])
  const [message,setMessage] = useState("")
  const [username, setUsername] = useState("")
  const navigate = useNavigate();
  const  messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!token || !storedUsername) {
      navigate('/Login');
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);


  const sendMessage = () => {
    if (message.trim() !== "" && {username, message}) {
      socket.emit("send_message",{ username, message });
      setMessageReceived((prevMessage) => [...prevMessage, {username, message}]);
      setMessage("")
    }
  };


  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessage) => [...prevMessage, {username: data.username, message: data.message}]);
    });

    return () => {
      socket.off("receive_message");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageReceived]);

  return(
  <section>
      <div className="msgbox">
        <h2 id='MessagesTitle'>Messages</h2>
          <div className="allMessages">
            <ul className="theList">
            {messageReceived.map((msg, index) => (
              <li className='singleMsg' key={index}>{`${msg.username}: ${msg.message}`}</li>
            ))}
            </ul>
          </div>
      </div>
      <div className="msgbutton">
        <input
          id='msgInput'
          value={ message }
          placeholder="Message..."
          onChange={(event) => {setMessage(event.target.value)}}
          onKeyDown={(event)=>{if(event.key==="Enter") sendMessage();}}/>
        <button onClick={sendMessage}>Send Message</button>
      </div>
  </section>
);

};

export default Chat
