import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "./card";
import { useLocation } from "react-router-dom";
import "../style.css";

type CardType = "cat" | "defuse" | "bomb" | "shuffle";

const Home: React.FC = () => {
  const cardTypes: CardType[] = ["cat", "defuse", "bomb", "shuffle"];
  const [cards, setCards] = useState<CardType[]>([]);
  const [defuseCount, setDefuseCount] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "lost" | "won" | "restart"
  >("restart");
  const [winCount, setWinCount] = useState<number>(0);
  const [lossCount, setLossCount] = useState<number>(0);
  const [showShufflePopup, setShowShufflePopup] = useState<boolean>(false);
  const [bombMessage, setBombMessage] = useState<string>("");
  const location = useLocation();
  const username = (location.state as any)?.username;

  useEffect(() => {
    if (!username) return;
  }, [username]);

  const generateCards = () => {
    const newCards: CardType[] = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * cardTypes.length);
      newCards.push(cardTypes[randomIndex]);
    }
    setCards(newCards);
    setGameStatus("playing");
    setDefuseCount(0);
    setBombMessage("");
  };

  const handleCardClick = (cardType: CardType, index: number) => {
    if (gameStatus !== "playing") return;

    if (cardType === "shuffle") {
      setShowShufflePopup(true);
      setTimeout(() => {
        generateCards();
        setShowShufflePopup(false);
      }, 1000);
      return;
    }

    const newCards = [...cards];
    newCards.splice(index, 1);

    switch (cardType) {
      case "cat":
        setCards(newCards);
        break;
      case "bomb":
        if (defuseCount > 0) {
          setDefuseCount(defuseCount - 1);
          setBombMessage("Bomb is diffused!");
          setTimeout(() => setBombMessage(""), 1000);
          setCards(newCards);
        } else {
          setGameStatus("lost");
          setLossCount(lossCount + 1);
          updateStats("loss");
        }
        break;
      case "defuse":
        setDefuseCount(defuseCount + 1);
        setCards(newCards);
        break;
      default:
        break;
    }

    if (newCards.length === 0) {
      setGameStatus("won");
      setWinCount(winCount + 1);
      updateStats("win");
    }
  };

  const updateStats = async (result: "win" | "loss") => {
    try {
      await axios.post(
        `http://localhost:8080/update-stats/${username}?result=${result}`
      );
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  return (
    <div className="home-page-div">
      <div className="win-loss-defuse-div">
        <p
          style={{
            marginRight: "10px",
          }}
        >
          Wins: {winCount}
        </p>
        <p
          style={{
            marginRight: "10px",
          }}
        >
          Losses: {lossCount}
        </p>
        <p>Defuse Count: {defuseCount}</p>
      </div>

      {gameStatus === "lost" ? (
        <div>
          <h2>You lost! The bomb exploded.</h2>
          <button onClick={generateCards} style={{ marginLeft: "100px" }}>
            Restart Game
          </button>
        </div>
      ) : gameStatus === "won" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h2>Congratulations! You won the game!</h2>
          <button onClick={generateCards}>Restart Game</button>
        </div>
      ) : (
        <>
          <button onClick={generateCards}>Start Game</button>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {cards.map((cardType, index) => (
              <Card
                key={index}
                cardType={cardType}
                onCardClick={() => handleCardClick(cardType, index)}
              />
            ))}
          </div>
        </>
      )}

      {showShufflePopup && (
        <div>
          <h3>Shuffling...</h3>
        </div>
      )}

      {bombMessage && (
        <div>
          <h3>{bombMessage}</h3>
        </div>
      )}
    </div>
  );
};

export default Home;
