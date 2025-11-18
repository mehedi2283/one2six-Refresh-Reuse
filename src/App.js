import React, { useMemo, useState } from "react";
import "./App.css";

const PRICING = {
  living: { label: "Living Areas (Living/Family)", price: 4250 },
  dining: { label: "Dining Room", price: 2250 },
  bedroom: { label: "Bedroom", price: 2600 },
  bathroom: { label: "Bathroom", price: 250 },
  kitchenArt: { label: "Kitchen (Art & Accessories)", price: 100 },

  kitchenEssentials: { label: "Kitchen Essentials (Add-on)", price: 500 },
  patio: { label: "Patio Area (Add-on)", price: 1000 },

  entryway: { label: "Entryway Package (Add-on)", price: 600 },
  office: { label: "Office / Den Package (Add-on)", price: 1000 },
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
  {
    id: "living",
    kind: "qty",
    image: "living.png",
    title: "Living Room",
    question: "How many living areas would you like refreshed?",
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
    id: "kitchenArt",
    kind: "qty",
    image: "Kitchen.png",
    title: "Kitchen (Art & Accessories)",
    question: "How many kitchen areas to decorate?",
    priceKey: "kitchenArt",
  },

  { id: "kitchenEssentials", kind: "qtyNoImage", title: "Kitchen Essentials (Add-on)", question: "Would you like to include Kitchen Essentials?", priceKey: "kitchenEssentials" },
  { id: "patio", kind: "qtyNoImage", title: "Patio Area (Add-on)", question: "Include patio area setup?", priceKey: "patio" },

  { id: "entryway", kind: "fixedNoImage", title: "Entryway Package (Add-on)", question: "Include entryway area setup?", priceKey: "entryway" },
  { id: "office", kind: "fixedNoImage", title: "Office / Den Package (Add-on)", question: "Include office area setup?", priceKey: "office" },

  { id: "summary", kind: "summary", title: "Your Quote Summary" },

  {
    id: "contact",
    kind: "contact",
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
  const [qty, setQty] = useState(
    Object.keys(PRICING).reduce((acc, k) => ({ ...acc, [k]: null }), {})
  );
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

  /* REQUIRED STEPS: disable Next until qty selected */
  const requiredQtySteps = ["living", "dining", "bedroom", "bathroom", "kitchenArt"];

  const isNextDisabled = () => {
    if (
      (current.kind === "qty" || current.kind === "qtyNoImage") &&
      requiredQtySteps.includes(current.priceKey)
    ) {
      return !qty[current.priceKey];
    }
    return false;
  };

  /* AUTO-NEXT for pills ONLY */
  const autoNext = () => {
    setTimeout(() => {
      setIsBack(false);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }, 150);
  };

  /* UPDATED setQuantity: only auto-next for pills */
  const setQuantity = (key, val, fromPill = false) => {
    setQty((s) => ({ ...s, [key]: val }));
    setError("");

    if (fromPill && val > 0) {
      autoNext(); // only pills auto-next
    }
  };

  const next = () => {
    setIsBack(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setIsBack(true);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo(0, 0);
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
    () => lineItems.reduce((s, i) => s + i.total, 0),
    [lineItems]
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    e.target.classList.remove("error");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing =
      !formData.name || !formData.address || !formData.email || !formData.phone;

    if (missing) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    const allItems = Object.keys(PRICING).map((key) => ({
      key,
      label: PRICING[key].label,
      qty: qty[key] || 0,
      unit: PRICING[key].price,
      total: (qty[key] || 0) * PRICING[key].price,
    }));

    const addOnKeys = ["kitchenEssentials", "patio", "entryway", "office"];
    const addOnsTotal = addOnKeys.reduce(
      (s, key) => s + (qty[key] || 0) * PRICING[key].price,
      0
    );

    const payload = {
      ...formData,
      quoteDetails: allItems,
      addOnsTotal,
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
      setError("Error submitting. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------ */

  return (
    <div className="page">
      <div className="topbar">
        <div className="progress">
          Step {step + 1} / {STEPS.length}
        </div>
      </div>

      <div
        key={`${step}-${isBack ? "back" : "forward"}`}
        className={`step-anim ${isBack ? "slide-in-left" : "slide-in-right"}`}
      >
        {/* INTRO ----------------------------------------------------- */}
        {current.kind === "intro" && (
          <section className="intro">
            <h1 className="lux-title">{current.title}</h1>
            <div className="intro-copy card">
              <p>{current.description}</p>
            </div>
            <div className="intro-btn">
              <button className="fancy-btn" onClick={next}>
                {current.cta}
              </button>
            </div>
            <div className="intro-images double">
              {current.images.map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </div>
          </section>
        )}

        {/* QTY WITH IMAGE ------------------------------------------- */}
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
                  {[1, 2, 3].map((num) => (
                    <QtyPill
                      key={num}
                      value={num}
                      active={qty[current.priceKey] === num}
                      onClick={() =>
                        setQuantity(current.priceKey, num, true) // pills auto-next
                      }
                    />
                  ))}

                  <input
                    type="number"
                    min="1"
                    className="qty-input"
                    placeholder="Qty"
                    value={qty[current.priceKey] > 3 ? qty[current.priceKey] : ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuantity(
                        current.priceKey,
                        isNaN(val) ? null : val,
                        false // manual input → NO auto-next
                      );
                    }}
                  />
                </div>

                <div className="nav-row">
                  <button className="fancy-btn reverse" onClick={back}>
                    ← Back
                  </button>

                  <button
                    className="fancy-btn"
                    disabled={isNextDisabled()}
                    onClick={next}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* QTY NO IMAGE --------------------------------------------- */}
        {current.kind === "qtyNoImage" && (
          <section className="step card no-image">
            <h2 className="lux-h2">{current.title}</h2>
            <p className="question">{current.question}</p>

            <div className="pill-row">
              {[1, 2, 3].map((num) => (
                <QtyPill
                  key={num}
                  value={num}
                  active={qty[current.priceKey] === num}
                  onClick={() =>
                    setQuantity(current.priceKey, num, true) // auto-next
                  }
                />
              ))}

              <input
                type="number"
                min="1"
                className="qty-input"
                placeholder="Qty"
                value={qty[current.priceKey] > 3 ? qty[current.priceKey] : ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(
                    current.priceKey,
                    isNaN(val) ? null : val,
                    false // no auto-next
                  );
                }}
              />
            </div>

            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Next →
              </button>
            </div>
          </section>
        )}

        {/* FIXED ADD-ON --------------------------------------------- */}
        {current.kind === "fixedNoImage" && (
          <section className="step card no-image">
            <h2 className="lux-h2">{current.title}</h2>
            <p className="question">{current.question}</p>

            <div className="pill-row">
              <QtyPill
                value="Add"
                active={qty[current.priceKey] === 1}
                onClick={() =>
                  setQuantity(
                    current.priceKey,
                    qty[current.priceKey] === 1 ? null : 1,
                    true // auto-next for add-on
                  )
                }
              />
            </div>

            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Next →
              </button>
            </div>
          </section>
        )}

        {/* SUMMARY --------------------------------------------------- */}
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
              <button className="fancy-btn reverse" onClick={back}>
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
              <form className="contact-form" onSubmit={handleSubmit}>
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
                {error && <div className="inline-error">{error}</div>}
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


        {/* THANK YOU ------------------------------------------------ */}
        {submitted && (
          <section className="thankyou card">
            <h2 className="lux-h2">Thank You!</h2>
            <p>Your quote has been sent. Our design team will reach out shortly.</p>
          </section>
        )}
      </div>
    </div>
  );
}
