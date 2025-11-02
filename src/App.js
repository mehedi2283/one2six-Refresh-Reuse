import React, { useMemo, useState } from "react";
import "./App.css";

const PRICING = {
  living: { label: "Living Areas (Living/Family)", price: 7800 },
  dining: { label: "Dining Room", price: 5400 },
  bedroom: { label: "Bedroom", price: 3350 },
  bathroom: { label: "Bathroom", price: 250 },
};

const STEPS = [
  {
    id: "intro",
    kind: "intro",
    title: "Refresh & Reuse — Sustainable Staging Made Simple",
    description:
      "Bring new life to your Airbnb or home using One Two Six Designs’ pre-loved inventory. Select how many rooms you'd like styled — we’ll build your instant quote.",
    cta: "Start My Quote",
    images: ["hero1.webp", "hero2.webp"],
  },
  { id: "living", kind: "qty", image: "living.png", title: "Living Room",
    question: "How many living spaces would you like refreshed?", priceKey: "living" },
  { id: "dining", kind: "qty", image: "Dining room.png", title: "Dining Room",
    question: "How many dining spaces are included?", priceKey: "dining" },
  { id: "bedroom", kind: "qty", image: "Bedroom.png", title: "Bedroom",
    question: "How many bedrooms would you like staged?", priceKey: "bedroom" },
  { id: "bathroom", kind: "qty", image: "Bathroom.png", title: "Bathrooms",
    question: "How many bathrooms to style?", priceKey: "bathroom" },
  { id: "summary", kind: "summary", title: "Your Quote Summary" },
  {
    id: "contact",
    kind: "contact",
    image:
      "https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png",
    title: "Your Refresh & Reuse Package Is Ready!",
    subtitle: "Please fill out your details and we’ll send you an estimate.",
  },
];

const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/9BZdBwDz8uXZfiw31MXE/webhook-trigger/7e8c226f-419e-4f73-853d-4975fb7a2371";

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
  const [isBack, setIsBack] = useState(false);

  const [qty, setQty] = useState({
    living: null,
    dining: null,
    bedroom: null,
    bathroom: null,
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
    return Object.entries(qty)
      .filter(([_, q]) => q && q > 0)
      .map(([key, q]) => ({
        key,
        label: PRICING[key].label,
        qty: q,
        unit: PRICING[key].price,
        total: PRICING[key].price * q,
      }));
  }, [qty]);

  const total = useMemo(
    () => lineItems.reduce((sum, it) => sum + it.total, 0),
    [lineItems]
  );

  const next = () => {
    if (current.kind === "qty" && qty[current.priceKey] === null) {
      setError("Please choose a quantity to continue.");
      return;
    }
    setIsBack(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setIsBack(true);
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
    } catch (err) {
      console.error("Webhook Error:", err);
      alert("Error submitting your quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="progress">
          Step {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* 🔑 This wrapper gets a new key every step to re-trigger CSS animations */}
      <div
        key={step}
        className={`step-anim ${isBack ? "slide-in-left" : "slide-in-right"}`}
      >
        {/* Intro */}
        {current.kind === "intro" && (
          <section className="intro">
            <h1 className="lux-title">{current.title}</h1>
            <div className="intro-copy card">
              <p>{current.description}</p>
            </div>
            <div className="intro-images double">
              {current.images.map((src, i) => (
                <img key={i} src={src} alt={`Hero ${i + 1}`} />
              ))}
            </div>
            <div className="intro-btn">
              <button className="fancy-btn" onClick={next}>
                {current.cta}
              </button>
            </div>
          </section>
        )}

        {/* Quantity Steps */}
        {current.kind === "qty" && (
          <section className="step card">
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
                  <button className="fancy-btn" onClick={back}>
                    ← Back
                  </button>
                  <button className="fancy-btn" onClick={next}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary */}
        {current.kind === "summary" && (
          <section className="summary card">
            <h2 className="lux-h2">{current.title}</h2>
            <ul className="summary-list">
              {lineItems.map((it) => (
                <li key={it.key}>
                  {it.qty} × {it.label}
                </li>
              ))}
            </ul>
            <div className="nav-row">
              <button className="fancy-btn" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Continue →
              </button>
            </div>
          </section>
        )}

        {/* Contact */}
        {current.kind === "contact" && !submitted && (
          <section className="contact card">
            <h2 className="lux-h2 contact-h2">{current.title}</h2>
            <p className="sub">{current.subtitle}</p>
            <div className="contact-grid">
              <div></div>
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {["name", "address", "email", "phone"].map((field) => (
                  <label key={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    <input
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                          ? "tel"
                          : "text"
                      }
                      name={field}
                      placeholder={`Enter your ${field}`}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                    />
                  </label>
                ))}
                {/* Optional custom error message surface */}
                {!formData.name ||
                !formData.address ||
                !formData.email ||
                !formData.phone ? (
                  <div className="inline-error">
                    All fields are required before sending.
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="fancy-btn wide"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Me My Quote"}
                </button>
              </form>
              <div></div>
            </div>
          </section>
        )}

        {/* Thank You */}
        {submitted && (
          <section className="thankyou card">
            <h2 className="lux-h2">Thank You!</h2>
            <p>
              Your quote has been sent. Our design team will reach out shortly.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
