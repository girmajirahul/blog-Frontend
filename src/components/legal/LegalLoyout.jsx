import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Cookie,
  ChevronRight,
  ArrowLeft,
  Clock,
  Mail,
} from "lucide-react";

import "./LegalPages.css";

const icons = {
  privacy: ShieldCheck,
  terms: FileText,
  cookies: Cookie,
};

const LegalLayout = ({
  type,
  title,
  description,
  lastUpdated = "November 3, 2026",
  sections,
}) => {
  const Icon = icons[type] || FileText;

  return (
    <main className="legal-page">
      <div className="legal-container">

        {/* Breadcrumb */}
        <div className="legal-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={15} />
          <span>Legal</span>
          <ChevronRight size={15} />
          <span>{title}</span>
        </div>

        {/* Hero */}
        <section className="legal-hero">
          <div className="legal-hero-icon">
            <Icon size={30} />
          </div>

          <span className="legal-eyebrow">LEGAL INFORMATION</span>

          <h1>{title}</h1>

          <p>{description}</p>

          <div className="legal-updated">
            <Clock size={15} />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </section>

        {/* Content */}
        <div className="legal-content-grid">

          {/* Table of contents */}
          <aside className="legal-sidebar">
            <div className="legal-sidebar-inner">
              <h3>On this page</h3>

              <nav>
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="legal-nav-link"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="legal-sidebar-help">
                <div className="legal-help-icon">
                  <Mail size={19} />
                </div>

                <h4>Need help?</h4>
                <p>
                  Have questions about our policies? Get in touch with us.
                </p>

                <a href="mailto:girmajirahul2@gmail.com">
                  Contact support
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </aside>

          {/* Main document */}
          <article className="legal-document">
            <div className="legal-document-intro">
              <span className="legal-document-label">
                {type === "privacy"
                  ? "YOUR PRIVACY MATTERS"
                  : type === "terms"
                  ? "PLATFORM GUIDELINES"
                  : "YOUR BROWSER EXPERIENCE"}
              </span>

              <p>
                Please read the following information carefully. It explains
                the policies and practices that apply when you use our website.
              </p>
            </div>

            {sections.map((section, index) => (
              <section
                className="legal-section"
                id={section.id}
                key={section.id}
              >
                <div className="legal-section-heading">
                  <span className="legal-section-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h2>{section.title}</h2>
                </div>

                <div className="legal-section-body">
                  {section.content}
                </div>
              </section>
            ))}

            <div className="legal-document-footer">
              <ShieldCheck size={21} />
              <p>
                Thank you for being part of our community. We are committed
                to maintaining a transparent and trustworthy platform.
              </p>
            </div>
          </article>

        </div>

        {/* Bottom navigation */}
        <section className="legal-bottom">
          <Link to="/" className="legal-back-link">
            <ArrowLeft size={17} />
            Back to home
          </Link>

          <div className="legal-bottom-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms</Link>
            <Link to="/cookie-policy">Cookies</Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default LegalLayout;