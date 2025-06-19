

import React from 'react'

export default function StarRating() {

   const StarRating = ({ rating, onRate }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onRate(star)}
          style={{
            cursor: "pointer",
            color: star <= rating ? "#f5b301" : "#ccc",
            fontSize: "20px",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

}


