import { useEffect, useState,useRef } from "react";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    const ws = new WebSocket("wss://chat-backend-t8m9.onrender.com/ws");

    ws.onopen = () => {
      console.log("Connected");
    };
    scrollToBottom();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.log("Bad message:", event.data);
      }
    };

    setSocket(ws);

    return () => ws.close();
  }, [joined]);

  function sendMessage() {
    if (socket && text.trim() !== "") {
      socket.send(JSON.stringify({
        name: name,
        text: text
      }));

      setText("");
    }
  }

  if (!joined) {
    return (
      <div className="container">
        <h2>Enter your name</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <button
          onClick={() => {
            if (name.trim() !== "") setJoined(true);
          }}
        >
          Join Chat
        </button>
      </div>
    );
  }
  const scrollToBottom = () => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

return (
  <div className="app">
    <div className="chat-container">

      <div className="header">
         Real-Time Chat
      </div>

      <div className="chat-box">
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.name === name ? "right" : "left"}`}>
            <div className="bubble">
              <div className="name">{msg.name}</div>
              <div className="text">{msg.text}</div>
                {msg.time && (
                <span className="time">{msg.time}</span>
                )}
            </div>
          </div>
        ))}
      
      </div>
      <div ref={chatEndRef}></div>
      <div className="input-box">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  </div>
);
}

export default App;