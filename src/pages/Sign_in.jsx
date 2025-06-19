import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/SignIn.css"; // Make sure this path matches your file location

export default function Sign_in() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = { username, password };

    try {
      const resp = await fetch("http://localhost:8080/signIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/plain"
        },
        body: JSON.stringify(data),
      });

      const msg = await resp.text();

      if (msg === "admin" || msg === "customer") {
        localStorage.setItem("username", username);
        navigate(`/${msg}_home`);
      } else {
        alert(msg);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Could not sign in");
    }
  }

  return (
  <div className="signin-container">
    <h4 className="signin-title">Sign In</h4>
    <form className="signin-form" onSubmit={handleSubmit}>
      <div className="signin-form-group">
        <label className="signin-label" htmlFor="username">Username</label>
        <input
          className="signin-input"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="signin-form-group">
        <label className="signin-label" htmlFor="password">Password</label>
        <input
          className="signin-input"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="signin-button" type="submit">
        Log In
      </button>
    </form>
  </div>
);


}
