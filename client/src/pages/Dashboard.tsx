import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { logoutUser } from "../store/authSlice";
import { 
  LogOut, 
  ShoppingBag, 
  Home, 
  MapPin, 
  Settings, 
  CreditCard,
  Plus
} from "lucide-react";

type ActiveTab = "overview" | "orders" | "addresses" | "settings";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Mock address list representing the addresses table relation
  const mockAddresses = [
    {
      id: 1,
      addressLine: "Flat 402, Signature Residency",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "INDIA",
      addressType: "Home",
      postalCode: "380015"
    },
    {
      id: 2,
      addressLine: "Office 12A, Dev Arcade",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "INDIA",
      addressType: "Office",
      postalCode: "380009"
    }
  ];

  // Mock orders list representing the orders table relation
  const mockOrders = [
    {
      id: 10294,
      date: "Jul 12, 2026",
      amount: "₹ 14,999.00",
      status: "DELIVERED",
      items: "Leather Jacket, Cotton Chinos"
    },
    {
      id: 10381,
      date: "Jul 15, 2026",
      amount: "₹ 2,499.00",
      status: "PENDING",
      items: "Minimalist Leather Belt"
    }
  ];

  return (
    <div className="app-dashboard">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-logo">
            <ShoppingBag size={20} />
            <span>OnlineStore</span>
          </div>

          <nav className="sidebar-menu">
            <div 
              onClick={() => setActiveTab("overview")} 
              className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
            >
              <Home size={18} />
              <span>Overview</span>
            </div>
            
            <div 
              onClick={() => setActiveTab("orders")} 
              className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
            >
              <ShoppingBag size={18} />
              <span>Orders</span>
            </div>

            <div 
              onClick={() => setActiveTab("addresses")} 
              className={`menu-item ${activeTab === "addresses" ? "active" : ""}`}
            >
              <MapPin size={18} />
              <span>Addresses</span>
            </div>

            <div 
              onClick={() => setActiveTab("settings")} 
              className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="sidebar-user">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="user-avatar-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="user-avatar-sm">
              {user?.name ? getInitials(user.name) : "U"}
            </div>
          )}
          <div className="user-info-sm">
            <span className="name">{user?.name}</span>
            <span className="role">{user?.emailAddress}</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        {/* Top Header bar */}
        <header className="dashboard-header">
          <h1>
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "orders" && "Order History"}
            {activeTab === "addresses" && "Saved Shipping Addresses"}
            {activeTab === "settings" && "Account Settings"}
          </h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn-icon-label" title="Sign Out">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Tab content switcher */}
        <div className="dashboard-view-body">
          {activeTab === "overview" && (
            <>
              {/* Summary Stats Panels */}
              <div className="info-banner-grid">
                <div className="info-card">
                  <div className="info-card-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="info-card-data">
                    <span className="label">Total Orders</span>
                    <span className="value">2 Orders</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="info-card-data">
                    <span className="label">Saved Locations</span>
                    <span className="value">2 Addresses</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <CreditCard size={20} />
                  </div>
                  <div className="info-card-data">
                    <span className="label">Account Status</span>
                    <span className="value">Verified</span>
                  </div>
                </div>
              </div>

              {/* Detail Panels grid */}
              <div className="dashboard-sections-grid">
                {/* Profile panel */}
                <section className="section-panel">
                  <div className="section-panel-header">
                    <h3>Account Info</h3>
                  </div>
                  
                  <div className="profile-overview-row">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="profile-large-avatar" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="profile-large-avatar-placeholder">
                        {user?.name ? getInitials(user.name) : "U"}
                      </div>
                    )}
                    <div className="profile-summary-info">
                      <h2>{user?.name}</h2>
                      <p>{user?.googleId ? "Logged in via Google Authentication" : "Standard Email Account"}</p>
                    </div>
                  </div>

                  <div className="profile-grid-fields">
                    <div className="field-block">
                      <span className="label">Customer ID</span>
                      <span className="value">#{user?.id}</span>
                    </div>

                    <div className="field-block">
                      <span className="label">Email Address</span>
                      <span className="value">{user?.emailAddress}</span>
                    </div>

                    <div className="field-block">
                      <span className="label">Phone Number</span>
                      <span className="value">{user?.phoneNumber || "Not registered"}</span>
                    </div>
                  </div>
                </section>

                {/* Recent orders preview panel */}
                <section className="section-panel">
                  <div className="section-panel-header">
                    <h3>Recent Transactions</h3>
                    <span style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setActiveTab("orders")}>View all</span>
                  </div>

                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockOrders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.amount}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <section className="section-panel">
              <div className="section-panel-header">
                <h3>Transactions Log</h3>
              </div>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Placed On</th>
                      <th>Purchased Items</th>
                      <th>Amount Paid</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>#{order.id}</td>
                        <td>{order.date}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{order.items}</td>
                        <td style={{ fontWeight: 500 }}>{order.amount}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "addresses" && (
            <section className="section-panel">
              <div className="section-panel-header">
                <h3>Shipping Destinations</h3>
                <button className="btn-icon-label" style={{ padding: '0.35rem 0.75rem' }}>
                  <Plus size={14} />
                  <span>Add Address</span>
                </button>
              </div>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Address</th>
                      <th>Location</th>
                      <th>Country</th>
                      <th>Postal Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAddresses.map(addr => (
                      <tr key={addr.id}>
                        <td>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-default)' }}>
                            {addr.addressType}
                          </span>
                        </td>
                        <td>{addr.addressLine}</td>
                        <td>{addr.city}, {addr.state}</td>
                        <td>{addr.country}</td>
                        <td style={{ fontFamily: 'monospace' }}>{addr.postalCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "settings" && (
            <div className="dashboard-sections-grid" style={{ gridTemplateColumns: '1fr' }}>
              <section className="section-panel" style={{ maxWidth: '600px' }}>
                <div className="section-panel-header">
                  <h3>Edit Profile Details</h3>
                </div>

                <form className="auth-form-body" onSubmit={e => e.preventDefault()}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user?.name || ""} />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user?.emailAddress || ""} disabled />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email address cannot be updated.</span>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue={user?.phoneNumber || ""} placeholder="No phone number registered" />
                  </div>

                  <button type="submit" className="btn-solid" style={{ alignSelf: 'flex-start', width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
                    Save Changes
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
