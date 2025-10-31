import React, { useMemo, useState } from "react";
import "./App.css";

/* ---------- Pricing (still used internally) ---------- */
const PRICING = {
  living: { label: "Living Areas (Living/Family)", price: 7800 },
  dining: { label: "Dining Room", price: 5400 },
  bedroom: { label: "Bedroom", price: 3350 },
  bathroom: { label: "Bathroom", price: 250 },
  kitchen: { label: "Kitchen (Art & Accessories)" },
  kitchenEssentials: { label: "Kitchen Essentials (Add-on)" },
  patio: { label: "Patio Area (Add-on)" },
  entryway: { label: "Entryway Package (Add-on)" },
  office: { label: "Office / Den Package (Add-on)" },
};

/* ---------- Steps ---------- */
const STEPS = [
  {
    id: "intro",
    kind: "intro",
    title: "Refresh & Reuse — Sustainable Staging Made Simple",
    description:
      "Bring new life to your Airbnb or home using One Two Six Designs’ pre-loved inventory. Select how many rooms you'd like styled — we’ll build your instant quote.",
    cta: "Start My Quote",
    images: ["hero1.webp", "hero2.webp"], // 👈 Two images now
  },
  {
    id: "living",
    kind: "qty",
    image: "living.png",
    title: "Living Room",
    question: "How many living spaces would you like refreshed?",
    priceKey: "living",
  },
  {
    id: "dining",
    kind: "qty",
    image: "Dining room.png",
    title: "Dining Room",
    question: "How many dining spaces are included?",
    priceKey: "dining",
  },
  {
    id: "bedroom",
    kind: "qty",
    image: "Bedroom.png",
    title: "Bedroom",
    question: "How many bedrooms would you like staged?",
    priceKey: "bedroom",
  },
  {
    id: "bathroom",
    kind: "qty",
    image: "Bathroom.png",
    title: "Bathrooms",
    question: "How many bathrooms to style?",
    priceKey: "bathroom",
  },
  {
    id: "addons",
    kind: "addons",
    image:
      "https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png", // 👈 Logo
    title: "Optional Add-ons",
    question: "Would you like to include any of these add-ons?",
    addOns: [
      { priceKey: "kitchen", note: "Art & accessories" },
      { priceKey: "kitchenEssentials" },
      { priceKey: "patio" },
      { priceKey: "entryway" },
      { priceKey: "office" },
    ],
  },
  {
    id: "summary",
    kind: "summary",
    title: "Your Quote Summary",
  },
  {
    id: "contact",
    kind: "contact",
    image:
      "https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png", // 👈 Logo
    title: "Your Refresh & Reuse Package Is Ready!",
    subtitle:
      "Please fill out your details and we’ll send you an estimate.",
  },
];

/* ---------- Webhook ---------- */
const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/9BZdBwDz8uXZfiw31MXE/webhook-trigger/7e8c226f-419e-4f73-853d-4975fb7a2371";

/* ---------- Helper Component ---------- */
const QtyPill = ({ value, active, onClick }) => (
  <button
    type="button"
    className={`qty-pill ${active ? "active" : ""}`}
    onClick={onClick}
  >
    {value}
  </button>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState({
    living: null,
    dining: null,
    bedroom: null,
    bathroom: null,
    kitchen: 0,
    kitchenEssentials: 0,
    patio: 0,
    entryway: 0,
    office: 0,
  });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];

  const setQuantity = (key, val) => {
    setQty((s) => ({ ...s, [key]: val }));
    setError("");
  };

  const lineItems = useMemo(() => {
    const items = [];
    Object.entries(qty).forEach(([key, q]) => {
      if (q && q > 0) {
        const { label, price } = PRICING[key];
        items.push({
          key,
          label,
          qty: q,
          unit: price || 0,
          total: (price || 0) * q,
        });
      }
    });
    return items;
  }, [qty]);

  const total = useMemo(
    () => lineItems.reduce((sum, it) => sum + it.total, 0),
    [lineItems]
  );

  const canProceed = () => {
    if (current.kind === "qty") {
      const k = current.priceKey;
      return qty[k] !== null;
    }
    return true;
  };

  const next = () => {
    if (!canProceed()) {
      setError("Please choose a quantity to continue.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo(0, 0);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      quoteDetails: lineItems,
      total,
      source: "One Two Six Website - Refresh & Reuse Quote Form",
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      console.error("Webhook Error:", err);
      setLoading(false);
      alert("There was a problem submitting your quote. Please try again.");
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">ONE TWO SIX</div>
        <div className="progress">
          Step {step + 1} / {STEPS.length}
        </div>
      </div>

      <div className="survey">
        {/* ----- Intro (Two images restored) ----- */}
        {current.kind === "intro" && (
          <section className="intro">
            <h1 className="lux-title">{current.title}</h1>
            <div className="intro-wrap">

              <div className="intro-copy card shadow">
                <p>{current.description}</p>
                
              </div>

              <div className="intro-images double">
                {current.images.map((src, i) => (
                  <img key={i} src={src} alt={`Hero ${i + 1}`} />
                ))}
                <button className="btn btn-primary" onClick={next}>
                  {current.cta}
                </button>
              </div>
              
              
            </div>
          </section>
        )}

        {/* Quantity Steps */}
        {current.kind === "qty" && (
          <section className="step card shadow">
            <h2 className="lux-h2">{current.title}</h2>
            <div className="fixed-grid">
              <div className="media">
                <img src={current.image} alt={current.title} />
              </div>
              <div className="content">
                <p className="question">{current.question}</p>
                <div className="pill-row">
                  {["1", "2", "3+"].map((label) => {
                    const mapped = label === "3+" ? 3 : parseInt(label, 10);
                    const active = qty[current.priceKey] === mapped;
                    return (
                      <QtyPill
                        key={label}
                        value={label}
                        active={active}
                        onClick={() => setQuantity(current.priceKey, mapped)}
                      />
                    );
                  })}
                </div>
                {error && <div className="inline-error">{error}</div>}
                <div className="nav-row">
                  <button className="btn btn-ghost" onClick={back}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={next}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Add-ons */}
        {current.kind === "addons" && (
          <section className="step card shadow">
            <h2 className="lux-h2">{current.title}</h2>
            <div className="fixed-grid">
              <div className="media">
                <img src={current.image} alt="Company logo" className="logo-img" />
              </div>
              <div className="content">
                <p className="question">{current.question}</p>
                <div className="addons">
                  {current.addOns.map(({ priceKey, note }) => (
                    <div className="addon-line" key={priceKey}>
                      <div className="addon-info">
                        <div className="addon-title">{PRICING[priceKey].label}</div>
                        <div className="addon-sub">{note || ""}</div>
                      </div>
                      <div className="pill-row compact">
                        {["1", "2", "3+"].map((label) => {
                          const mapped = label === "3+" ? 3 : parseInt(label, 10);
                          const active = qty[priceKey] === mapped;
                          return (
                            <QtyPill
                              key={label}
                              value={label}
                              active={active}
                              onClick={() => setQuantity(priceKey, mapped)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="nav-row">
                  <button className="btn btn-ghost" onClick={back}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={next}>
                    Review →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary */}
        {current.kind === "summary" && (
          <section className="summary card shadow">
            <h2 className="lux-h2">{current.title}</h2>
            <ul className="summary-list">
              {lineItems.map((it) => (
                <li key={it.key}>
                  {it.qty} × {it.label}
                </li>
              ))}
            </ul>
            <div className="nav-row">
              <button className="btn btn-ghost" onClick={back}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={next}>
                Continue →
              </button>
            </div>
          </section>
        )}

        {/* Contact */}
        {current.kind === "contact" && !submitted && (
          <section className="contact card shadow">
            <h2 className="lux-h2">{current.title}</h2>
            <p className="sub">{current.subtitle}</p>
            <div className="fixed-grid">
              <div className="media">
                <img src={current.image} alt="Company logo" className="logo-img" />
              </div>
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <button type="submit" className="btn btn-primary wide" disabled={loading}>
                  {loading ? "Sending..." : "Send Me My Quote"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Thank You */}
        {submitted && (
          <section className="thankyou card shadow">
            <h2 className="lux-h2">Thank You!</h2>
            <p>Your quote has been sent. Our design team will reach out shortly.</p>
          </section>
        )}
      </div>
    </div>
  );
}
