
import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Search, ShoppingBag, UserRound, Menu, X, Plus, Minus,
  Heart, ShieldCheck, Truck, RotateCcw, Sparkles, Package, LayoutDashboard,
  LogOut, Trash2, ChevronDown, CheckCircle2, Clock3, SlidersHorizontal
} from "lucide-react";
import api from "./context/api";
import { money } from "./components/format";

const categories = ["All", "Tech", "Fashion", "Home", "Accessories"];

const fallbackProducts = [
  {
    _id: "demo1",
    name: "Studio Wireless Headphones",
    category: "Tech",
    price: 4299,
    compareAtPrice: 5499,
    stock: 18,
    featured: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    description: "Immersive sound and considered comfort for your everyday."
  },
  {
    _id: "demo2",
    name: "Everyday Carry Backpack",
    category: "Accessories",
    price: 2499,
    compareAtPrice: 3199,
    stock: 24,
    featured: true,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description: "A versatile companion for work, travel, and everything between."
  },
  {
    _id: "demo3",
    name: "Minimal Ceramic Table Lamp",
    category: "Home",
    price: 1899,
    compareAtPrice: 2299,
    stock: 12,
    featured: true,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    description: "Warm ambient lighting with a sculptural, minimal silhouette."
  },
  {
    _id: "demo4",
    name: "Classic Chronograph Watch",
    category: "Accessories",
    price: 5999,
    compareAtPrice: 7499,
    stock: 9,
    featured: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    description: "A timeless dial and refined details for every day."
  }
];

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("shopsphere_cart") || "[]")
  );

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("shopsphere_user") || "null")
  );

  const [token, setToken] = useState(() =>
    localStorage.getItem("shopsphere_token") || ""
  );

  const [modal, setModal] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [drawer, setDrawer] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [checkout, setCheckout] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminForm, setAdminForm] = useState({
    name: "",
    description: "",
    category: "Tech",
    price: "",
    compareAtPrice: "",
    image: "",
    stock: "10",
    featured: false
  });

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  useEffect(() => {
    localStorage.setItem("shopsphere_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    api.get("/products", {
      params: { category, search, sort }
    })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts(fallbackProducts));
  }, [category, search, sort]);

  useEffect(() => {
    if (token && user) {
      api.get("/orders/my")
        .then(({ data }) => setOrders(data.orders))
        .catch(() => {});

      if (user.role === "admin") {
        api.get("/orders")
          .then(({ data }) => setAllOrders(data.orders))
          .catch(() => {});
      }
    }
  }, [token, user]);

  const featured = useMemo(
    () => products.filter(p => p.featured).slice(0, 4),
    [products]
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function saveSession(data) {
    localStorage.setItem("shopsphere_token", data.token);
    localStorage.setItem("shopsphere_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setModal("");
    setError("");

    showNotice(
      `Welcome${data.user.name ? `, ${data.user.name.split(" ")[0]}` : ""}!`
    );
  }

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/register";

      const { data } = await api.post(endpoint, authForm);
      saveSession(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not connect to the server. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("shopsphere_token");
    localStorage.removeItem("shopsphere_user");

    setToken("");
    setUser(null);
    setOrders([]);
    setAllOrders([]);
    setDrawer("");

    showNotice("You have been signed out.");
  }

  function addToCart(product) {
    setCart(current => {
      const found = current.find(
        item => item._id === product._id
      );

      if (found) {
        return current.map(item =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock || 99
                )
              }
            : item
        );
      }

      return [
        ...current,
        { ...product, quantity: 1 }
      ];
    });

    showNotice("Added to your bag");
  }

  function changeQuantity(id, delta) {
    setCart(current =>
      current.map(item =>
        item._id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(
                  item.quantity + delta,
                  item.stock || 99
                )
              )
            }
          : item
      )
    );
  }

  async function placeOrder(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: checkout
      };

      const { data } = await api.post("/orders", payload);

      setCart([]);
      setModal("");
      setDrawer("");

      setOrders(current => [data.order, ...current]);

      showNotice("Order placed — thank you for shopping with us!");

      setDrawer("orders");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to place order."
      );
    } finally {
      setLoading(false);
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/products", {
        ...adminForm,
        price: Number(adminForm.price),
        compareAtPrice: Number(adminForm.compareAtPrice),
        stock: Number(adminForm.stock)
      });

      const { data } = await api.get("/products");

      setProducts(data.products);

      setAdminForm({
        name: "",
        description: "",
        category: "Tech",
        price: "",
        compareAtPrice: "",
        image: "",
        stock: "10",
        featured: false
      });

      showNotice("Product published successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not add product."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);

      setProducts(current =>
        current.filter(p => p._id !== id)
      );

      showNotice("Product removed.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete product."
      );
    }
  }

  async function updateStatus(id, status) {
    try {
      const { data } = await api.patch(
        `/orders/${id}/status`,
        { status }
      );

      setAllOrders(current =>
        current.map(order =>
          order._id === id ? data.order : order
        )
      );

      showNotice("Order status updated.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update order."
      );
    }
  }

  function openCheckout() {
    if (!token) {
      setAuthMode("login");
      setModal("auth");
      setDrawer("");
      return;
    }

    setCheckout(current => ({
      ...current,
      fullName: current.fullName || user?.name || ""
    }));

    setError("");
    setModal("checkout");
    setDrawer("");
  }

  function openProductDetails(product) {
    setSelectedProduct(product);
    setModal("product");
    setError("");
  }

  return (
    <div className="app-shell">

      <div className="announcement">
        <Sparkles size={13} />
        A little more thoughtful. A lot more you.
        <span>Free shipping on orders over ₹2,500</span>
      </div>

      <header className="site-header">

        <button
          className="mobile-menu icon-btn"
          onClick={() => setDrawer("menu")}
          aria-label="Open menu"
        >
          <Menu />
        </button>

        <a
          className="brand"
          href="#"
          onClick={e => {
            e.preventDefault();
            setDrawer("");
            setModal("");
            setCategory("All");
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          }}
        >
          <span className="brand-mark">s.</span>
          <span>
            shopsphere<span className="brand-dot">.</span>
          </span>
        </a>

        <nav className="main-nav">
          <a href="#shop">Shop all</a>
          <a href="#story">Our approach</a>
          <a href="#journal">Journal</a>
        </nav>

        <div className="header-actions">

          <label className="header-search">
            <Search size={17} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </label>

          <button
            className="icon-btn account-btn"
            onClick={() =>
              user
                ? setDrawer("account")
                : (setAuthMode("login"), setModal("auth"))
            }
            aria-label="Account"
          >
            <UserRound size={20} />
          </button>

          <button
            className="bag-btn"
            onClick={() => setDrawer("cart")}
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} />
            <span>Bag</span>
            <b>{cartCount}</b>
          </button>

        </div>
      </header>

      {user?.role === "admin" && (
        <div className="admin-strip">
          <ShieldCheck size={15} />
          Administrator mode
          <button onClick={() => setDrawer("admin")}>
            Open dashboard <ArrowRight size={14} />
          </button>
        </div>
      )}

      <main>

        <section className="hero">

          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              THE EVERYDAY EDITION
            </div>

            <h1>
              Good things.<br />
              <em>Better living.</em>
            </h1>

            <p>
              Considered essentials, little luxuries, and everyday
              favourites. Find the things that make your world feel
              more like you.
            </p>

            <a className="primary-btn" href="#shop">
              Explore the collection <ArrowRight size={17} />
            </a>

            <div className="hero-note">
              <span className="note-avatars">✳ ◉ ✦</span>
              Thoughtfully picked. Happily kept.
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-main" />
            <div className="hero-image-small" />

            <div className="floating-note">
              <span>THE GOOD<br />STUFF</span>
              <b>№ 01</b>
            </div>

            <div className="hero-stamp">
              MADE FOR<br />
              YOUR EVERYDAY <span>✳</span>
            </div>
          </div>

          <div className="hero-index">
            01 — 04 <span />
          </div>

        </section>

        <section className="benefits">

          <div>
            <Truck />
            <span>
              <b>Free shipping</b>
              <small>On orders above ₹2,500</small>
            </span>
          </div>

          <div>
            <ShieldCheck />
            <span>
              <b>Secure checkout</b>
              <small>Your details stay protected</small>
            </span>
          </div>

          <div>
            <RotateCcw />
            <span>
              <b>Easy returns</b>
              <small>7-day return window</small>
            </span>
          </div>

          <div>
            <Heart />
            <span>
              <b>Picked with care</b>
              <small>Quality over quantity</small>
            </span>
          </div>

        </section>

        <section className="shop-section section-wrap" id="shop">

          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                THE COLLECTION
              </div>

              <h2>
                Find your <em>favourite.</em>
              </h2>
            </div>

            <p>
              Good design, useful details, and things<br />
              you’ll reach for again and again.
            </p>
          </div>

          <div className="shop-toolbar">

            <div className="category-tabs">
              {categories.map(c => (
                <button
                  key={c}
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="sort-control">
              <SlidersHorizontal size={15} />

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>

              <ChevronDown size={14} />
            </label>

          </div>

          <div className="product-grid">

            {products.map((product, index) => (
              <article
                className="product-card"
                key={product._id}
                onClick={() => openProductDetails(product)}
                style={{ cursor: "pointer" }}
              >

                <div className="product-image-wrap">

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={e => {
                      e.currentTarget.src =
                        fallbackProducts[index % fallbackProducts.length].image;
                    }}
                  />

                  {product.featured && (
                    <span className="product-tag">
                      CURATED PICK
                    </span>
                  )}

                  <button
                    className="quick-add"
                    onClick={e => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0
                      ? "Sold out"
                      : (
                        <>
                          <Plus size={16} />
                          Add to bag
                        </>
                      )}
                  </button>

                </div>

                <div className="product-info">

                  <div>
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>
                  </div>

                  <div className="product-price">
                    <b>{money(product.price)}</b>

                    {product.compareAtPrice > product.price && (
                      <del>{money(product.compareAtPrice)}</del>
                    )}
                  </div>

                </div>

                <div className="stock-note">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Currently unavailable"}
                </div>

              </article>
            ))}

          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <Package size={28} />
              <h3>No products found</h3>
              <p>Try another search or category.</p>

              <button
                className="text-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters <ArrowRight size={15} />
              </button>
            </div>
          )}

        </section>

        <section className="story-section" id="story">

          <div className="story-image">
            <div className="story-caption">
              LESS, BUT<br />
              <em>BETTER.</em>
              <span>THE SHOPSPHERE WAY</span>
            </div>
          </div>

          <div className="story-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              A MORE CONSIDERED WAY
            </div>

            <h2>
              Buy less.<br />
              <em>Love it longer.</em>
            </h2>

            <p>
              We believe the best things aren't the most things.
              They're the pieces that earn their place in your day —
              useful, beautiful, and made to be enjoyed.
            </p>

            <a href="#shop" className="text-btn">
              Discover the edit <ArrowRight size={16} />
            </a>

            <div className="story-sign">
              The ShopSphere team <span>✳</span>
            </div>
          </div>

        </section>

        <section className="newsletter section-wrap" id="journal">

          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              THE GOOD LETTER
            </div>

            <h2>
              A little good<br />
              <em>in your inbox.</em>
            </h2>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              showNotice("Thanks for joining our little corner!");
              e.currentTarget.reset();
            }}
          >
            <p>
              New finds, thoughtful notes, and the occasional treat.
              No noise, promise.
            </p>

            <div className="newsletter-input">
              <input
                type="email"
                required
                placeholder="Your email address"
              />

              <button aria-label="Subscribe">
                <ArrowRight />
              </button>
            </div>

            <small>
              By subscribing, you agree to receive occasional updates from us.
            </small>
          </form>

        </section>

      </main>

      <footer className="footer">

        <div className="footer-top">

          <a className="brand footer-brand" href="#">
            <span className="brand-mark">s.</span>
            <span>
              shopsphere<span className="brand-dot">.</span>
            </span>
          </a>

          <p>
            Thoughtful finds for<br />
            everyday living.
          </p>

          <div className="footer-links">
            <a href="#shop">Shop</a>
            <a href="#story">Our approach</a>
            <a href="#journal">Journal</a>
          </div>

          <div className="footer-social">
            INSTAGRAM ↗<br />
            PINTEREST ↗
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 ShopSphere. Made for the everyday.</span>
          <span>Privacy · Terms · India (INR ₹)</span>
        </div>

      </footer>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {error && (
        <div
          className="error-toast"
          onClick={() => setError("")}
        >
          {error}
          <X size={15} />
        </div>
      )}

      {/* DRAWER */}

      {drawer && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setDrawer("");
            }
          }}
        >

          <aside className="drawer">

            <div className="drawer-head">

              <div>
                <span className="eyebrow">SHOPSPHERE</span>

                <h3>
                  {drawer === "cart"
                    ? "Your bag"
                    : drawer === "account"
                    ? "Your account"
                    : drawer === "orders"
                    ? "Your orders"
                    : drawer === "admin"
                    ? "Admin studio"
                    : "Menu"}
                </h3>
              </div>

              <button
                className="icon-btn"
                onClick={() => setDrawer("")}
              >
                <X />
              </button>

            </div>

            {drawer === "cart" && (
              <>

                <div className="drawer-content">

                  {cart.length === 0 ? (
                    <div className="empty-state">
                      <ShoppingBag />
                      <h3>Your bag is taking a breather.</h3>
                      <p>Find something lovely to bring home.</p>

                      <button
                        className="primary-btn"
                        onClick={() => setDrawer("")}
                      >
                        Explore the shop <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="cart-item" key={item._id}>

                        <img src={item.image} alt={item.name} />

                        <div className="cart-item-info">
                          <span>{item.category}</span>
                          <b>{item.name}</b>
                          <strong>{money(item.price)}</strong>

                          <div className="qty-control">

                            <button
                              onClick={() => changeQuantity(item._id, -1)}
                            >
                              <Minus size={13} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() => changeQuantity(item._id, 1)}
                            >
                              <Plus size={13} />
                            </button>

                            <button
                              className="remove-btn"
                              onClick={() =>
                                setCart(c =>
                                  c.filter(p => p._id !== item._id)
                                )
                              }
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </div>

                      </div>
                    ))
                  )}

                </div>

                {cart.length > 0 && (
                  <div className="drawer-summary">

                    <div>
                      <span>Subtotal</span>
                      <b>{money(subtotal)}</b>
                    </div>

                    <div>
                      <span>Shipping</span>
                      <b>{shipping === 0 ? "Free" : money(shipping)}</b>
                    </div>

                    <div className="summary-total">
                      <span>Total</span>
                      <b>{money(total)}</b>
                    </div>

                    <button
                      className="primary-btn full-btn"
                      onClick={openCheckout}
                    >
                      Continue to checkout <ArrowRight size={16} />
                    </button>

                    <small>
                      Taxes included. Shipping calculated at checkout.
                    </small>

                  </div>
                )}

              </>
            )}

            {drawer === "account" && (
              <div className="drawer-content account-content">

                <div className="profile-circle">
                  {user?.name?.[0]?.toUpperCase()}
                </div>

                <h3>{user?.name}</h3>
                <p>{user?.email}</p>

                <button
                  className="secondary-btn full-btn"
                  onClick={() => setDrawer("orders")}
                >
                  View my orders
                </button>

                {user?.role === "admin" && (
                  <button
                    className="secondary-btn full-btn"
                    onClick={() => setDrawer("admin")}
                  >
                    Admin dashboard
                  </button>
                )}

                <button className="text-btn" onClick={logout}>
                  <LogOut size={15} /> Sign out
                </button>

              </div>
            )}

            {drawer === "orders" && (
              <div className="drawer-content">

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <Package />
                    <h3>No orders yet</h3>
                    <p>Your next favourite thing is waiting.</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div className="order-card" key={order._id}>

                      <div className="order-card-top">
                        <b>
                          #{order._id.slice(-7).toUpperCase()}
                        </b>

                        <span className={`status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>

                      <p>
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }
                        )}
                        {" · "}
                        {order.items.length} item(s)
                      </p>

                      <strong>{money(order.total)}</strong>

                    </div>
                  ))
                )}

              </div>
            )}

            {drawer === "admin" && (
              <div className="drawer-content admin-content">

                <div className="admin-metrics">

                  <div>
                    <span>Products</span>
                    <b>{products.length}</b>
                  </div>

                  <div>
                    <span>Orders</span>
                    <b>{allOrders.length}</b>
                  </div>

                  <div>
                    <span>Revenue</span>
                    <b>
                      {money(allOrders.reduce((s, o) => s + o.total, 0))}
                    </b>
                  </div>

                </div>

                <h4>
                  <Plus size={16} /> Add a product
                </h4>

                <form className="admin-form" onSubmit={addProduct}>

                  <input
                    required
                    placeholder="Product name"
                    value={adminForm.name}
                    onChange={e =>
                      setAdminForm({
                        ...adminForm,
                        name: e.target.value
                      })
                    }
                  />

                  <textarea
                    required
                    placeholder="Product description"
                    value={adminForm.description}
                    onChange={e =>
                      setAdminForm({
                        ...adminForm,
                        description: e.target.value
                      })
                    }
                  />

                  <div className="form-row">

                    <select
                      value={adminForm.category}
                      onChange={e =>
                        setAdminForm({
                          ...adminForm,
                          category: e.target.value
                        })
                      }
                    >
                      {categories
                        .filter(c => c !== "All")
                        .map(c => (
                          <option key={c}>{c}</option>
                        ))}
                    </select>

                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="Price ₹"
                      value={adminForm.price}
                      onChange={e =>
                        setAdminForm({
                          ...adminForm,
                          price: e.target.value
                        })
                      }
                    />

                  </div>

                  <div className="form-row">

                    <input
                      type="number"
                      min="0"
                      placeholder="Compare price"
                      value={adminForm.compareAtPrice}
                      onChange={e =>
                        setAdminForm({
                          ...adminForm,
                          compareAtPrice: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={adminForm.stock}
                      onChange={e =>
                        setAdminForm({
                          ...adminForm,
                          stock: e.target.value
                        })
                      }
                    />

                  </div>

                  <input
                    required
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={adminForm.image}
                    onChange={e =>
                      setAdminForm({
                        ...adminForm,
                        image: e.target.value
                      })
                    }
                  />

                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={adminForm.featured}
                      onChange={e =>
                        setAdminForm({
                          ...adminForm,
                          featured: e.target.checked
                        })
                      }
                    />
                    Feature on homepage
                  </label>

                  <button
                    className="primary-btn full-btn"
                    disabled={loading}
                  >
                    {loading ? "Publishing..." : "Publish product"}
                  </button>

                </form>

                <h4>
                  <Package size={16} /> Manage products
                </h4>

                {products.map(p => (
                  <div className="admin-list-row" key={p._id}>

                    <span>
                      {p.name}
                      <small>{money(p.price)}</small>
                    </span>

                    <button onClick={() => deleteProduct(p._id)}>
                      <Trash2 size={15} />
                    </button>

                  </div>
                ))}

                <h4>
                  <LayoutDashboard size={16} /> Recent orders
                </h4>

                {allOrders.length === 0 ? (
                  <p className="muted">No orders received yet.</p>
                ) : (
                  allOrders.map(o => (
                    <div className="admin-order" key={o._id}>

                      <div>
                        <b>
                          #{o._id.slice(-7).toUpperCase()}
                        </b>

                        <small>
                          {o.user?.name || "Customer"} · {money(o.total)}
                        </small>
                      </div>

                      <select
                        value={o.status}
                        onChange={e =>
                          updateStatus(o._id, e.target.value)
                        }
                      >
                        {[
                          "Processing",
                          "Confirmed",
                          "Shipped",
                          "Delivered",
                          "Cancelled"
                        ].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>

                    </div>
                  ))
                )}

              </div>
            )}

            {drawer === "menu" && (
              <div className="drawer-content menu-content">

                <a onClick={() => setDrawer("")} href="#shop">
                  Shop all
                </a>

                <a onClick={() => setDrawer("")} href="#story">
                  Our approach
                </a>

                <a onClick={() => setDrawer("")} href="#journal">
                  Journal
                </a>

                <button onClick={() => setDrawer("cart")}>
                  Shopping bag ({cartCount})
                </button>

              </div>
            )}

          </aside>

        </div>
      )}

      {/* MODALS */}

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setModal("");
              setError("");
            }
          }}
        >

          <div className="modal-card">

            <button
              className="modal-close icon-btn"
              onClick={() => {
                setModal("");
                setError("");
              }}
            >
              <X />
            </button>

            {/* PRODUCT DETAILS MODAL */}

            {modal === "product" && selectedProduct && (
              <div className="product-details">

                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: "100%",
                    height: "240px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "20px"
                  }}
                  onError={e => {
                    e.currentTarget.src =
                      fallbackProducts[0].image;
                  }}
                />

                <span className="product-category">
                  {selectedProduct.category}
                </span>

                <h2>{selectedProduct.name}</h2>

                <div className="product-price">

                  <b>{money(selectedProduct.price)}</b>

                  {selectedProduct.compareAtPrice > selectedProduct.price && (
                    <del>
                      {money(selectedProduct.compareAtPrice)}
                    </del>
                  )}

                </div>

                <p className="modal-sub">
                  {selectedProduct.description ||
                    "A thoughtfully selected everyday essential."}
                </p>

                <p>
                  {selectedProduct.stock > 0
                    ? `${selectedProduct.stock} items available`
                    : "Currently unavailable"}
                </p>

                <button
                  className="primary-btn full-btn"
                  disabled={selectedProduct.stock === 0}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setModal("");
                  }}
                >
                  {selectedProduct.stock > 0
                    ? "Add to bag"
                    : "Sold out"}

                  <ArrowRight size={16} />
                </button>

              </div>
            )}

            {/* LOGIN AND REGISTRATION MODAL */}

            {modal === "auth" && (
              <>
                <div className="modal-brand">
                  <span className="brand-mark">s.</span>
                </div>

                <div className="eyebrow centered">
                  A GOOD PLACE TO BEGIN
                </div>

                <h2>
                  {authMode === "login"
                    ? "Welcome back."
                    : "Make yourself at home."}
                </h2>

                <p className="modal-sub">
                  {authMode === "login"
                    ? "Sign in to pick up where you left off."
                    : "Create an account and make the everyday yours."}
                </p>

                <form className="auth-form" onSubmit={submitAuth}>

                  {authMode === "register" && (
                    <input
                      required
                      placeholder="Your name"
                      value={authForm.name}
                      onChange={e =>
                        setAuthForm({
                          ...authForm,
                          name: e.target.value
                        })
                      }
                    />
                  )}

                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={authForm.email}
                    onChange={e =>
                      setAuthForm({
                        ...authForm,
                        email: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    minLength="8"
                    type="password"
                    placeholder="Password (at least 8 characters)"
                    value={authForm.password}
                    onChange={e =>
                      setAuthForm({
                        ...authForm,
                        password: e.target.value
                      })
                    }
                  />

                  <button
                    className="primary-btn full-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Sign in"
                      : "Create account"}

                    <ArrowRight size={16} />
                  </button>

                </form>

                <p className="switch-auth">

                  {authMode === "login"
                    ? "New around here?"
                    : "Already have an account?"}

                  <button
                    onClick={() => {
                      setAuthMode(
                        authMode === "login" ? "register" : "login"
                      );
                      setError("");
                    }}
                  >
                    {authMode === "login"
                      ? "Create an account"
                      : "Sign in"}
                  </button>

                </p>
              </>
            )}

            {/* CHECKOUT MODAL */}

            {modal === "checkout" && (
              <>
                <div className="eyebrow">
                  ALMOST YOURS
                </div>

                <h2>Delivery details.</h2>

                <p className="modal-sub">
                  Where should we bring your good things?
                </p>

                <form className="auth-form" onSubmit={placeOrder}>

                  <input
                    required
                    placeholder="Full name"
                    value={checkout.fullName}
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        fullName: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    type="tel"
                    pattern="[0-9+ -]{10,15}"
                    placeholder="Phone number"
                    value={checkout.phone}
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        phone: e.target.value
                      })
                    }
                  />

                  <textarea
                    required
                    placeholder="House / street / area"
                    value={checkout.address}
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        address: e.target.value
                      })
                    }
                  />

                  <div className="form-row">

                    <input
                      required
                      placeholder="City"
                      value={checkout.city}
                      onChange={e =>
                        setCheckout({
                          ...checkout,
                          city: e.target.value
                        })
                      }
                    />

                    <input
                      required
                      placeholder="PIN code"
                      pattern="[0-9]{6}"
                      value={checkout.postalCode}
                      onChange={e =>
                        setCheckout({
                          ...checkout,
                          postalCode: e.target.value
                        })
                      }
                    />

                  </div>

                  <div className="payment-note">
                    <ShieldCheck size={17} />

                    <span>
                      <b>Cash on Delivery</b>
                      <small>Pay when your order arrives.</small>
                    </span>
                  </div>

                  <div className="checkout-total">
                    <span>Order total</span>
                    <b>{money(total)}</b>
                  </div>

                  <button
                    className="primary-btn full-btn"
                    disabled={loading}
                  >
                    {loading ? "Placing order..." : "Place my order"}
                    <ArrowRight size={16} />
                  </button>

                </form>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
