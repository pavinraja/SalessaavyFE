import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Orders.css";
import "../components/StarRating";

// ⭐ StarRating Component
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productRatings, setProductRatings] = useState({});
  const [ratedProductIds, setRatedProductIds] = useState(new Set());
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/getOrders/${username}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        console.log("Fetched orders:", data);

        const filteredSorted = data
          .filter((order) => order !== null && order.status !== "CREATED")
          .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

        setOrders(filteredSorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const handleReturn = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8080/requestReturn/${orderId}`, {
        method: "PUT",
      });
      const msg = await res.text();
      alert(msg);
      window.location.reload();
    } catch (err) {
      alert("Return request failed");
    }
  };

  const isReturnEligible = (order) => {
    if ( order.status.toUpperCase() !== "DELIVERED") return false;
    else return true;
  };

  const rateProduct = async (productId, rating) => {
    if (ratedProductIds.has(productId)) return;

    try {
      const res = await fetch(`http://localhost:8080/products/${productId}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const msg = await res.text();
      alert(msg);

      setRatedProductIds((prev) => new Set(prev).add(productId));
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate("/")}>
          🛍️ Sales Savvy
        </div>
        <ul className="nav-links">
          <li onClick={() => navigate("/customer_home")}>Home</li>
          <li onClick={() => navigate("/cart")}>Cart</li>
          <li onClick={() => navigate("/orders")}>Orders</li>
          <li
            onClick={() => {
              localStorage.clear();
              navigate("/sign_in", { replace: true });
            }}
          >
            Logout
          </li>
        </ul>
      </nav>

      <div className="orders-container">
        <h2>Your Orders</h2>

        {loading && <p className="text-center">Loading…</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && orders.length === 0 && <p>No paid or delivered orders yet.</p>}

        {!loading && orders.length > 0 && (
          <div className="orders-list">
            {orders
              .filter((order) => order !== null && order !== undefined)
              .map((order) => (
                <div className="order-card" key={order.id}>
                  <h3>Order ID: {order.id}</h3>
                  <p><strong>Placed On:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                  {order.deliveryTime && (
                    <p><strong>Delivered On:</strong> {new Date(order.deliveryTime).toLocaleString()}</p>
                  )}
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ₹{order.amount / 100}</p>
                  <p><strong>Payment ID:</strong> {order.paymentId || "—"}</p>

                  <h4>Items:</h4>
                  <ul className="items-list">
                    {order.items?.map((item, index) => (
                      <li key={index}>
                        {item.product?.name || "Unknown Product"} x {item.quantity} — ₹
                        {item.product?.price ? item.product.price * item.quantity : 0}
                      </li>
                    ))}
                  </ul>

                  {order.status.toUpperCase() === "DELIVERED" && (
                    <>
                      <h4>Rate Products:</h4>
                      <ul className="items-list">
                        {order.items?.map((item, idx) => {
                          const product = item.product;
                          if (!product) return null;

                          return (
                            <li key={idx}>
                              {product.name || "Unknown Product"} — ₹
                              {product.price ? product.price * item.quantity : 0}
                              <div style={{ marginTop: "5px" }}>
                                <StarRating
                                  rating={productRatings[product.id] || 0}
                                  onRate={(star) => {
                                    setProductRatings((prev) => ({
                                      ...prev,
                                      [product.id]: star,
                                    }));
                                    rateProduct(product.id, star);
                                  }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  {isReturnEligible(order) && (
                    <button className="return-btn" onClick={() => handleReturn(order.id)}>
                      Request Return
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}