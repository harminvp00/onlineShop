import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { logoutUser, updateProfile } from "../store/authSlice";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setActiveAddress
} from "../store/addressSlice";
import type { Address } from "../store/addressSlice";
import {
  fetchProducts,
  fetchCategories,
  addProduct,
  editProduct,
  removeProduct,
  syncDummyProducts,
  resetSyncSuccess
} from "../store/productSlice";
import type { Product } from "../store/productSlice";
import {
  LogOut,
  MapPin,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Edit,
  X,
  RefreshCw,
  ShoppingCart,
  PlusCircle,
  Package,
  CheckCircle,
  Settings
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();

  // Redux State
  const { user } = useAppSelector((state) => state.auth);
  const { addresses, activeAddress, isLoading: addressLoading } = useAppSelector((state) => state.addresses);
  const { products, categories, isLoading: productsLoading, syncSuccess } = useAppSelector((state) => state.products);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [activeAddressOverlay, setActiveAddressOverlay] = useState(false);
  const [activeProfileOverlay, setActiveProfileOverlay] = useState(false);
  
  // Manage Catalog drawer state
  const [catalogMode, setCatalogMode] = useState(false); // whether to show edit/delete on product cards
  const [showProductDrawer, setShowProductDrawer] = useState(false); // open add/edit drawer
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Address card state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states (Address)
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // Form states (Profile)
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || "");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Form states (Product)
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodOrigPrice, setProdOrigPrice] = useState("");
  const [prodSellPrice, setProdSellPrice] = useState("");
  const [prodStock, setProdStock] = useState("");

  // Load data on init
  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // If profile name is updated in store, reset form value
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phoneNumber || "");
    }
  }, [user]);

  // Sync success watch
  useEffect(() => {
    if (syncSuccess) {
      dispatch(fetchProducts());
      dispatch(fetchCategories());
      dispatch(resetSyncSuccess());
    }
  }, [syncSuccess, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    
    try {
      await dispatch(updateProfile({ name: profileName, phoneNumber: profilePhone || null })).unwrap();
      setProfileSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        setProfileSuccessMsg("");
        setActiveProfileOverlay(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !city.trim() || !stateName.trim() || !addressType) return;

    try {
      if (editingAddress) {
        await dispatch(
          updateAddress({
            id: editingAddress.id,
            addressData: {
              addressLine,
              city,
              state: stateName,
              postalCode: postalCode || null,
              addressType,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          addAddress({
            addressLine,
            city,
            state: stateName,
            postalCode: postalCode || null,
            addressType,
          })
        ).unwrap();
      }
      
      // Reset address form
      setAddressLine("");
      setCity("");
      setStateName("");
      setPostalCode("");
      setAddressType("Home");
      setEditingAddress(null);
      setShowAddressForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setStateName(addr.state);
    setPostalCode(addr.postalCode || "");
    setAddressType(addr.addressType);
    setShowAddressForm(true);
  };

  const handleAddressDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this address?")) {
      dispatch(deleteAddress(id));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodDesc.trim() || !prodImg.trim() || !prodOrigPrice || !prodStock || !prodCategory.trim()) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      productName: prodName,
      productDescription: prodDesc,
      imageUrl: prodImg,
      categoryName: prodCategory,
      originalPrice: parseFloat(prodOrigPrice),
      sellingPrice: prodSellPrice ? parseFloat(prodSellPrice) : null,
      stock: parseInt(prodStock),
    };

    try {
      if (editingProduct) {
        await dispatch(editProduct({ id: editingProduct.productId, productData: payload })).unwrap();
      } else {
        await dispatch(addProduct(payload)).unwrap();
      }
      // Reset and close
      closeProductDrawer();
      dispatch(fetchProducts());
      dispatch(fetchCategories());
    } catch (err) {
      console.error(err);
      alert("Failed to save product details");
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.productName);
    setProdDesc(prod.productDescription);
    setProdImg(prod.imageUrl);
    setProdCategory(prod.category?.categoryName || "");
    setProdOrigPrice(prod.originalPrice.toString());
    setProdSellPrice(prod.sellingPrice ? prod.sellingPrice.toString() : "");
    setProdStock(prod.stock.toString());
    setShowProductDrawer(true);
  };

  const handleProductDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(removeProduct(id)).unwrap();
      } catch (err) {
        console.error(err);
        alert("Failed to delete product");
      }
    }
  };

  const closeProductDrawer = () => {
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setProdImg("");
    setProdCategory("");
    setProdOrigPrice("");
    setProdSellPrice("");
    setProdStock("");
    setShowProductDrawer(false);
  };

  const handleSyncClick = () => {
    dispatch(syncDummyProducts());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategoryFilter !== "All" ? selectedCategoryFilter : undefined,
      })
    );
  };

  const handleCategoryFilterSelect = (catName: string) => {
    setSelectedCategoryFilter(catName);
    dispatch(
      fetchProducts({
        search: searchQuery || undefined,
        category: catName !== "All" ? catName : undefined,
      })
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="amazon-layout" onClick={() => {
      // Close dropdowns when clicking outside
      setActiveAddressOverlay(false);
      setActiveProfileOverlay(false);
    }}>
      {/* Primary Header */}
      <header className="amazon-header" onClick={(e) => e.stopPropagation()}>
        {/* Logo */}
        <div className="amazon-brand" onClick={() => {
          setSearchQuery("");
          setSelectedCategoryFilter("All");
          dispatch(fetchProducts());
        }}>
          Online<span>Store</span>
        </div>

        {/* Address Location selector */}
        <div className="nav-location-widget" onClick={() => {
          setActiveAddressOverlay(!activeAddressOverlay);
          setActiveProfileOverlay(false);
        }}>
          <MapPin size={20} style={{ color: "#ffffff", marginTop: "4px" }} />
          <div className="nav-location-text">
            <span className="label">
              {user ? `Deliver to ${user.name.split(" ")[0]}` : "Deliver to"}
            </span>
            <span className="value">
              {activeAddress
                ? `${activeAddress.city} ${activeAddress.postalCode || ""}`
                : "Select Address"}
            </span>
          </div>
          <ChevronDown size={12} style={{ color: "#ccc", marginLeft: "2px" }} />
        </div>

        {/* Address Popover Card */}
        {activeAddressOverlay && (
          <div className="floating-overlay-card address-overlay-card">
            <div className="card-header-title">
              <span>Choose your delivery location</span>
              <X
                size={16}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveAddressOverlay(false)}
              />
            </div>
            
            {addressLoading ? (
              <div style={{ fontSize: "0.8rem", padding: "1rem", textAlign: "center" }}>Loading...</div>
            ) : (
              <div className="address-list-compact">
                {addresses.length === 0 ? (
                  <div style={{ fontSize: "0.78rem", color: "#555", textAlign: "center", padding: "1rem 0" }}>
                    No saved addresses. Add one below!
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-item-compact ${activeAddress?.id === addr.id ? "active" : ""}`}
                      onClick={() => dispatch(setActiveAddress(addr))}
                    >
                      <input
                        type="radio"
                        checked={activeAddress?.id === addr.id}
                        onChange={() => dispatch(setActiveAddress(addr))}
                      />
                      <div className="address-item-details">
                        <span className="type-badge">{addr.addressType}</span>
                        <div className="line">{addr.addressLine}</div>
                        <div className="city-state">
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </div>
                        <div className="address-actions-compact">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditAddress(addr);
                            }}
                          >
                            Edit
                          </button>
                          <button onClick={(e) => handleAddressDelete(addr.id, e)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Address Form Toggle button */}
            {!showAddressForm ? (
              <button
                className="btn-card-action-secondary"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressLine("");
                  setCity("");
                  setStateName("");
                  setPostalCode("");
                  setAddressType("Home");
                  setShowAddressForm(true);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
              >
                <Plus size={14} /> Add new address
              </button>
            ) : (
              <form onSubmit={handleAddressSubmit} className="compact-form">
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111" }}>
                  {editingAddress ? "Edit Shipping Details" : "New Shipping Address"}
                </span>

                <div className="compact-form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Apartment, suite, unit, etc."
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                  />
                </div>

                <div className="compact-form-row">
                  <div className="compact-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="compact-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="compact-form-row">
                  <div className="compact-form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="compact-form-group">
                    <label>Label</label>
                    <select value={addressType} onChange={(e) => setAddressType(e.target.value)}>
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <button type="submit" className="btn-card-action" style={{ flex: 1 }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-card-action-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Search Bar */}
        <form className="amazon-search-bar" onSubmit={handleSearchSubmit}>
          <select
            className="search-category-select"
            value={selectedCategoryFilter}
            onChange={(e) => handleCategoryFilterSelect(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryName}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Search OnlineStore"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button-yellow">
            <Search size={20} />
          </button>
        </form>

        {/* Right nav widgets */}
        <div className="amazon-nav-right">
          {/* Account Lists Popover Trigger */}
          <div
            className="nav-interactive-widget"
            onClick={() => {
              setActiveProfileOverlay(!activeProfileOverlay);
              setActiveAddressOverlay(false);
            }}
          >
            <span className="label">Hello, {user ? user.name.split(" ")[0] : "Sign In"}</span>
            <span className="value">
              Account & Settings{" "}
              <ChevronDown size={12} style={{ color: "#ccc", marginLeft: "2px" }} />
            </span>

            {activeProfileOverlay && (
              <div
                className="floating-overlay-card profile-overlay-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="card-header-title">
                  <span>Your Settings</span>
                  <X
                    size={16}
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveProfileOverlay(false)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "0.5rem" }}>
                  
                  <div className="user-avatar-sm" style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}>
                    {user?.name ? getInitials(user.name) : "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#666" }}>{user?.emailAddress}</div>
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div style={{ fontSize: "0.78rem", color: "green", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <CheckCircle size={14} /> {profileSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="compact-form" style={{ borderTop: "1px solid #eeeeee", paddingTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Update Details</span>
                  
                  <div className="compact-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="compact-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-card-action" style={{ marginTop: "0.25rem" }}>
                    Save Profile Changes
                  </button>
                </form>

                <button
                  onClick={handleLogout}
                  className="btn-card-action-secondary"
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    color: "#cc0c39",
                    borderColor: "#f5c4c4",
                    backgroundColor: "#fff5f5"
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="nav-interactive-widget">
            <span className="label">Returns</span>
            <span className="value">& Orders</span>
          </div>

          {/* Cart Widget */}
          <div className="cart-widget">
            <div className="cart-icon-wrapper">
              <ShoppingCart size={24} />
              <div className="cart-count">0</div>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginTop: "auto" }}>Cart</span>
          </div>
        </div>
      </header>

      {/* Sub Navbar */}
      <div className="amazon-sub-nav">
        <div className="sub-nav-links">
          <div className="sub-nav-item">All</div>
          <div className="sub-nav-item">Today's Deals</div>
          <div className="sub-nav-item" onClick={() => dispatch(fetchProducts())}>Catalog</div>
          <div className="sub-nav-item">Customer Service</div>
          <div className="sub-nav-item">Registry</div>
          <div className="sub-nav-item">Gift Cards</div>
          <div className="sub-nav-item">Sell</div>
        </div>

        <div className="sub-nav-links">
          {/* Admin toggle catalog CRUD mode */}
          <button
            className={`sub-nav-item admin-btn`}
            onClick={() => setCatalogMode(!catalogMode)}
            style={{ border: "none" }}
          >
            <Settings size={14} />
            {catalogMode ? "Exit Store Manager" : "Store Manager"}
          </button>
        </div>
      </div>

      {/* Main Page Layout */}
      <main className="storefront-container">
        {/* Amazon Hero Promo Banner */}
        <div className="storefront-hero-banner">
          <div className="hero-banner-content">
            <h1>Deals of the Week on OnlineStore</h1>
            <p>Shop appliances, clothing, home essentials, and tech accessories. Flat 20% off for verified users using cards checkout.</p>
            <button className="btn-amazon-accent" onClick={() => {
              setSearchQuery("");
              setSelectedCategoryFilter("All");
              dispatch(fetchProducts());
            }}>
              Explore Deals
            </button>
          </div>
        </div>

        {/* Products Grid & Catalog Filter area */}
        <section className="storefront-catalog-section">
          <div className="storefront-filters-row">
            <span className="results-count">
              {productsLoading
                ? "Loading products..."
                : `${products.length} product${products.length !== 1 ? "s" : ""} available`}
            </span>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {catalogMode && (
                <button
                  className="btn-card-action"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductDrawer(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    borderRadius: "20px",
                    padding: "0.4rem 1.2rem"
                  }}
                >
                  <PlusCircle size={16} /> Add Product
                </button>
              )}

              {products.length > 0 && (
                <button
                  onClick={handleSyncClick}
                  className="btn-card-action-secondary"
                  disabled={productsLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.78rem",
                    borderRadius: "20px",
                    padding: "0.4rem 1rem"
                  }}
                >
                  <RefreshCw size={14} className={productsLoading ? "spin-animation" : ""} /> Sync Products
                </button>
              )}
            </div>
          </div>

          {/* Sync CTA if catalog is empty */}
          {!productsLoading && products.length === 0 ? (
            <div className="empty-catalog-sync-banner">
              <Package size={64} style={{ color: "#ccc" }} />
              <h2>No Products in Catalog</h2>
              <p>Your database catalog is currently empty. Fetch and import 50+ beautiful dummy products from DummyJSON API to populate your store immediately.</p>
              <button
                className="btn-amazon-accent"
                onClick={handleSyncClick}
                disabled={productsLoading}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw size={16} /> Sync DummyJSON Products
              </button>
            </div>
          ) : (
            <div className="amazon-products-grid">
              {products.map((prod) => (
                <div key={prod.productId} className="product-card-amazon">
                  {prod.category && (
                    <span className="product-card-category-badge">
                      {prod.category.categoryName}
                    </span>
                  )}
                  
                  <div className="product-card-img-wrapper">
                    <img src={prod.imageUrl} alt={prod.productName} />
                  </div>

                  <h3 className="product-card-title">{prod.productName}</h3>
                  <p className="product-card-description">{prod.productDescription}</p>

                  <div className="product-card-price-row">
                    <span className="selling-price">
                      ₹{prod.sellingPrice ? parseFloat(prod.sellingPrice.toString()).toLocaleString() : parseFloat(prod.originalPrice.toString()).toLocaleString()}
                    </span>
                    {prod.sellingPrice && (
                      <>
                        <span className="original-price">
                          ₹{parseFloat(prod.originalPrice.toString()).toLocaleString()}
                        </span>
                        <span className="discount-percent">
                          ({Math.round(((parseFloat(prod.originalPrice.toString()) - parseFloat(prod.sellingPrice.toString())) / parseFloat(prod.originalPrice.toString())) * 100)}% off)
                        </span>
                      </>
                    )}
                  </div>

                  <div className={`product-card-stock ${parseInt(prod.stock.toString()) <= 5 ? "low-stock" : ""}`}>
                    {parseInt(prod.stock.toString()) > 0
                      ? `In Stock (${parseInt(prod.stock.toString())} left)`
                      : "Out of Stock"}
                  </div>

                  <div className="product-card-actions">
                    <button className="btn-amazon-buy">Add to Cart</button>
                    
                    {/* Admin Actions */}
                    {catalogMode && (
                      <div className="product-card-admin-actions">
                        <button onClick={() => startEditProduct(prod)}>
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          className="btn-delete-prod"
                          onClick={() => handleProductDelete(prod.productId)}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Add/Edit Drawer Modal */}
      {showProductDrawer && (
        <div className="modal-backdrop-blur" onClick={closeProductDrawer}>
          <div className="drawer-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>
                <Package size={20} />
                {editingProduct ? "Edit Product Details" : "Add New Store Product"}
              </h3>
              <button className="drawer-close-btn" onClick={closeProductDrawer}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body-scroll">
              <form onSubmit={handleProductSubmit} className="prod-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter product title"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Category (e.g. Beauty, Electronics)"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/image.jpg"
                    value={prodImg}
                    onChange={(e) => setProdImg(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe product details, sizes, specs..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    style={{
                      fontFamily: "inherit",
                      fontSize: "0.88rem",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #a6a6a6",
                      borderRadius: "3px",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div className="price-inputs-row">
                  <div className="form-group">
                    <label>Original Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      placeholder="999.00"
                      value={prodOrigPrice}
                      onChange={(e) => setProdOrigPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="799.00"
                      value={prodSellPrice}
                      onChange={(e) => setProdSellPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="submit" className="btn-amazon-accent" style={{ flex: 1, padding: "0.75rem" }}>
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    className="btn-card-action-secondary"
                    style={{ flex: 1, padding: "0.75rem" }}
                    onClick={closeProductDrawer}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
