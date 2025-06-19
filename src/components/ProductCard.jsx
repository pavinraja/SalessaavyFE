import React, { useState } from "react";
import "../styles/Productcard.css";

/**
 * Props:
 *   product       { id, name, price, description, photo, rating }
 *   onAddToCart   fn(product, qty)
 */
export default function ProductCard({ product, onAddToCart }) {
  const [qty, setQty] = useState(1);
  if (!product) return null;

  const inc = () => setQty((q) => q + 1);
  const dec = () => setQty((q) => Math.max(1, q - 1));

  // 🔸 Round rating to nearest half
  const rating = Math.round((product.rating || 0) * 2) / 2;

  return (
    <article className="product-card">
      <figure className="product-img-wrap">
        <img
          src={product.photo || "/placeholder.png"}
          alt={product.name}
          loading="lazy"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
      </figure>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">₹{product.price}</p>
        <p className="product-desc">{product.description}</p>

        {/* ⭐ Show star rating only if rating > 0 */}
        {rating > 0 && (
          <div className="product-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  color:
                    star <= Math.floor(rating)
                      ? "#f5b301"
                      : star - 0.5 === rating
                      ? "linear-gradient(to right, #f5b301 50%, #ccc 50%)"
                      : "#ccc",
                }}
              >
                ★
              </span>
            ))}
            <span style={{ fontSize: "0.9rem", marginLeft: "6px", color: "#555" }}>
              ({rating.toFixed(1)})
            </span>
          </div>
        )}

        <div className="qty-control">
          <button onClick={dec} aria-label="decrease quantity">−</button>
          <span>{qty}</span>
          <button onClick={inc} aria-label="increase quantity">+</button>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => onAddToCart(product, qty)}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
