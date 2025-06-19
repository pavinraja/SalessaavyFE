import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/AdminHome.css";

export default function Admin_home() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/admin/orders', {
      withCredentials: true // ⭐ Add this line
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error('Failed to fetch orders:', err));
  }, []);

  const updateStatus = (orderId, newStatus) => {
    axios.put(`http://localhost:8080/admin/orders/${orderId}/status`, newStatus, {
      headers: { 'Content-Type': 'text/plain' },
      withCredentials: true // ⭐ Add this line
    })
    .then(() => {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    })
    .catch(err => console.error('Failed to update status:', err));
  };

  const handleLogout = async () => {
  try {
    await axios.post("http://localhost:8080/logout", {}, {
      withCredentials: true // ⭐ Needed for session cookies
    });
    localStorage.clear();
    window.location.href = "/"; // full redirect to clear browser state
  } catch (error) {
    console.error("Logout failed:", error);
  }
};


  const renderStatusControls = (order) => {
    if (order.status === 'RETURN_REQUESTED') {
      return (
        <div className="return-request-actions">
          <label>Handle Return Request:</label>
          <select
            onChange={e => updateStatus(order.id, e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Choose</option>
            <option value="RETURN_ACCEPTED">Accept</option>
            <option value="RETURN_REJECTED">Reject</option>
          </select>
        </div>
      );
    } else if (
      order.status !== 'RETURN_ACCEPTED' &&
      order.status !== 'RETURN_REJECTED'
    ) {
      return (
        <div className="status-update">
          <label>Change Status:</label>
          <select
            value={order.status}
            onChange={e => updateStatus(order.id, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      );
    }
    return null;
  };

  const renderBadge = (status) => {
    const map = {
      Pending: { class: "badge pending", label: "⏳ Pending" },
      Processing: { class: "badge processing", label: "🔄 Processing" },
      Shipped: { class: "badge shipped", label: "📦 Shipped" },
      Delivered: { class: "badge delivered", label: "✅ Delivered" },
      Cancelled: { class: "badge cancelled", label: "❌ Cancelled" },
      RETURN_REQUESTED: { class: "badge return-request", label: "↩️ Return Requested" },
      RETURN_ACCEPTED: { class: "badge return-accepted", label: "✅ Return Accepted" },
      RETURN_REJECTED: { class: "badge return-rejected", label: "❌ Return Rejected" },
    };
    const badge = map[status] || { class: "badge", label: status };
    return <span className={badge.class}>{badge.label}</span>;
  };

  return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="admin-logo">Admin Dashboard</div>
        <div className="admin-nav-links">
          <NavLink to="/pm" className="nav-link">Product Management</NavLink>
          <button onClick={handleLogout} className="nav-link logout">Logout</button>
        </div>
      </nav>

      <h2 className="orders-heading">All Orders</h2>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <h3>Order ID: {order.id}</h3>
            <p>Order Date: {new Date(order.orderTime).toLocaleString()}</p>
            <p>Status: {renderBadge(order.status)}</p>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  {item.product ? (
                    <>
                      <img src={item.product.photo} alt={item.product.name} />
                      <div>
                        <p className="product-name">{item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="product-warning">⚠️ Product not found</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {renderStatusControls(order)}
          </div>
        ))}
      </div>
    </div>
  );
}
