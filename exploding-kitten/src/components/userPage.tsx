import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style.css";

interface LeaderboardEntry {
  username: string;
  wins: number;
  losses: number;
}

const User: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get<LeaderboardEntry[]>(
        "http://localhost:8080/leaderboard"
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async () => {
    if (!username.trim()) {
      alert("Please enter a valid username");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/register", {
        username,
      });
      console.log("Registration Response:", response);
      alert("User registered successfully");
      fetchLeaderboard();
      navigate("/home", { state: { username } });
    } catch (error) {
      console.error("Registration Error:", error);

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          alert("Username already taken. Try a different username.");
        } else {
          alert(
            `Error registering user: ${error.response.status} ${error.response.statusText}`
          );
        }
      } else {
        alert("Failed to register user. Try a different username.");
      }
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      alert("Please enter a valid username");
      return;
    }

    try {
      await axios.post("http://localhost:8080/login", { username });
      alert("User login successful");
      fetchLeaderboard();
      navigate("/home", { state: { username } });
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Try a different username.");
    }
  };

  return (
    <div className="user-page-div">
      <h1>Enter Your Username</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="user-name-input"
      />
      <div>
        <button onClick={handleRegister} className="register-button">
          Register
        </button>
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
      </div>

      <div>
        <h2>Leaderboard</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Username
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Wins
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {entry.username}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {entry.wins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;
