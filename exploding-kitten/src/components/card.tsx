import React from "react";
import explodingCat from "../images/exploding-cat.jpg";
import "../style.css";
type CardProps = {
  cardType: "cat" | "defuse" | "bomb" | "shuffle";
  onCardClick: () => void;
};

function Card({ cardType, onCardClick }: CardProps) {
  return (
    <div>
      <div className="card" onClick={onCardClick}>
        <img
          src={explodingCat}
          style={{
            width: "80px",
            height: "80px",
          }}
        />
      </div>
      <p
        style={{
          marginLeft: "40px",
        }}
      >
        {cardType}
      </p>
    </div>
  );
}

export default Card;
