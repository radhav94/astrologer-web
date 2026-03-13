import { useState } from "react";
import { Icons } from "../../../../../components/Icons";
import { Link } from "react-router-dom";
import styles from "./FAQs.module.scss";
import SectionHeader from "../../../../../components/UI/sectionHeader/SectionHeader";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    "Account & Profile",
    "Offers & Wallets",
    "Payments & Refunds",
    "App Features & Navigation",
    "Consultations & Bookings",
    "Privacy & Data Security",
  ];

  const questions = [
    {
      q: "How long do refunds take?",
      a: "Refunds typically take 5-7 business days to reflect in your original payment method, depending on your bank's processing time.",
    },
    {
      q: "My payment went through, but the consultation didn't start. What should I do?",
      a: "If the amount is deducted but your session didn't begin, your booking will auto-retry. If it still doesn't start, raise a ticket and our team will review it and issue a refund if applicable.",
    },
    {
      q: "Will I get a refund if the astrologer doesn't respond or ends the session early?",
      a: "Yes, you are only charged for the actual duration of the consultation. Any unused balance is returned to your wallet immediately.",
    },
    {
      q: "I was charged twice. How can I fix this?",
      a: "Please report this transaction via the 'Recent Tickets' section. Attach screenshots of both deductions, and we will process a refund for the duplicate charge within 24 hours.",
    },
    {
      q: "Can I cancel a booked session?",
      a: "Yes, you can cancel a scheduled session up to 10 minutes before the start time without any penalty.",
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <SectionHeader title="FAQs" />

      <div className={styles.content}>
        <h2 className={styles.subtitle}>
          Find Clear Answers to All Your Astrology App Questions. Select from
          the topics below
        </h2>

        {/* Categories */}
        <div className={styles.categories}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`${styles.categoryButton} ${
                idx === 2 ? styles.active : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions Accordion */}
        <div className={styles.accordion}>
          {questions.map((item, idx) => (
            <div
              key={idx}
              className={`${styles.accordionItem} ${
                openIndex === idx ? styles.expanded : ""
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className={styles.questionButton}
              >
                <span className={styles.questionText}>
                  {item.q}
                </span>
                <span className={styles.icon}>
                  {openIndex === idx ? (
                    <Icons.Minus size={18} />
                  ) : (
                    <Icons.Plus size={18} />
                  )}
                </span>
              </button>

              <div
                className={`${styles.answer} ${
                  openIndex === idx ? styles.expanded : ""
                }`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerText}>Still have a query?</span>
        <button className={styles.contactButton}>
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQs;
