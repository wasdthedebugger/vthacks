import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import {
  MetricChart,
  MoodChart,
  MoodComparisonChart,
  SleepChart,
  useThemeColors,
} from "../components/Charts.jsx";
import {
  ComplianceCard,
  JournalTimeline,
  PartnerCompare,
  StatTile,
} from "../components/Panels.jsx";

const mean = (xs) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

const fmt = (n, d = 1) => Number(n).toFixed(d);

const bucketLabel = {
  high: "High severity",
  moderate: "Moderate",
  stable: "Stable",
};

/* =========================================================
   DEMO PHARMA / CLINICAL MATCH DATABASE
   ========================================================= */

const clinicalMatches = [
  {
    id: "rx-001",
    name: "Somniva",
    category: "Sleep",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "sleep",
      "insomnia",
      "sleep quality",
      "sleep duration",
      "night waking",
    ],
    description:
      "Demo sleep-focused product surfaced because this report contains sleep-related findings.",
    action: "Order patient sample",
  },

  {
    id: "rx-002",
    name: "Restora",
    category: "Sleep",
    type: "Non-prescription",
    sponsor: false,
    matchKeywords: [
      "sleep",
      "sleep quality",
      "sleep duration",
      "night waking",
    ],
    description:
      "Demo non-sponsored option related to the sleep signals identified in this report.",
    action: "View information",
  },

  {
    id: "rx-003",
    name: "Cardiovex",
    category: "Cardiovascular",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "heart rate",
      "resting heart rate",
      "hrv",
      "cardiovascular",
      "heart",
    ],
    description:
      "Demo cardiovascular product surfaced because of cardiovascular-related report terms.",
    action: "Order patient sample",
  },

  {
    id: "rx-004",
    name: "Cardia",
    category: "Cardiovascular",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "heart rate",
      "resting heart rate",
      "hrv",
      "cardiovascular",
      "heart",
    ],
    description:
      "Demo non-sponsored cardiovascular information resource.",
    action: "View information",
  },

  {
    id: "rx-005",
    name: "Respira",
    category: "Respiratory",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "breathing",
      "breathing rate",
      "respiratory",
      "breath",
    ],
    description:
      "Demo respiratory product associated with respiratory-related findings.",
    action: "Order patient sample",
  },

  {
    id: "rx-006",
    name: "Calmora",
    category: "Sleep & stress",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "sleep",
      "stress",
      "anxiety",
      "energy",
      "mood",
    ],
    description:
      "Demo non-sponsored educational option related to sleep, stress, and energy.",
    action: "View information",
  },

  {
    id: "rx-007",
    name: "Somnex",
    category: "Sleep",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "sleep",
      "sleep duration",
      "sleep quality",
      "insomnia",
    ],
    description:
      "Demo pharmaceutical product associated with sleep-related clinical discussion.",
    action: "Order patient sample",
  },

  {
    id: "rx-008",
    name: "HRV Balance",
    category: "Recovery",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "hrv",
      "heart rate variability",
      "recovery",
      "heart rate",
    ],
    description:
      "Demo educational option related to recovery and physiological signals.",
    action: "View information",
  },

  {
    id: "rx-009",
    name: "Energen",
    category: "Energy",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "energy",
      "fatigue",
      "sleep",
      "mood",
    ],
    description:
      "Demo product associated with reports containing fatigue and energy-related findings.",
    action: "Order patient sample",
  },

  {
    id: "rx-010",
    name: "Wellvia",
    category: "Wellness",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "energy",
      "mood",
      "stress",
      "sleep",
    ],
    description:
      "Demo educational resource related to general wellness signals.",
    action: "View information",
  },

  {
    id: "rx-011",
    name: "Pulmora",
    category: "Respiratory",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "breathing",
      "respiratory",
      "breath",
      "sleep",
    ],
    description:
      "Demo respiratory product surfaced from breathing-related report language.",
    action: "Order patient sample",
  },

  {
    id: "rx-012",
    name: "Sleepwell",
    category: "Sleep",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "sleep",
      "sleep quality",
      "sleep duration",
    ],
    description:
      "Demo educational sleep resource.",
    action: "View information",
  },

  {
    id: "rx-013",
    name: "Vascora",
    category: "Cardiovascular",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "heart",
      "heart rate",
      "resting heart rate",
      "cardiovascular",
    ],
    description:
      "Demo cardiovascular product for report-related educational discussion.",
    action: "Order patient sample",
  },

  {
    id: "rx-014",
    name: "Recovera",
    category: "Recovery",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "hrv",
      "recovery",
      "sleep",
      "energy",
    ],
    description:
      "Demo recovery-focused educational resource.",
    action: "View information",
  },

  {
    id: "rx-015",
    name: "Serenex",
    category: "Stress",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "stress",
      "anxiety",
      "mood",
      "sleep",
    ],
    description:
      "Demo product associated with stress and mood-related report terminology.",
    action: "Order patient sample",
  },

  {
    id: "rx-016",
    name: "MoodBalance",
    category: "Mood",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "mood",
      "anxiety",
      "stress",
      "energy",
    ],
    description:
      "Demo non-sponsored educational option related to mood signals.",
    action: "View information",
  },

  {
    id: "rx-017",
    name: "Cardiara",
    category: "Cardiovascular",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "heart",
      "hrv",
      "heart rate",
      "cardiovascular",
    ],
    description:
      "Demo cardiovascular product surfaced by cardiovascular report language.",
    action: "Order patient sample",
  },

  {
    id: "rx-018",
    name: "Breathwell",
    category: "Respiratory",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "breathing",
      "breathing rate",
      "respiratory",
    ],
    description:
      "Demo respiratory educational resource.",
    action: "View information",
  },

  {
    id: "rx-019",
    name: "Somnera",
    category: "Sleep",
    type: "Prescription therapy",
    sponsor: true,
    matchKeywords: [
      "sleep",
      "insomnia",
      "sleep quality",
    ],
    description:
      "Demo sponsored sleep product.",
    action: "Order patient sample",
  },

  {
    id: "rx-020",
    name: "VitalTrack",
    category: "Monitoring",
    type: "Non-sponsored",
    sponsor: false,
    matchKeywords: [
      "heart rate",
      "hrv",
      "breathing",
      "sleep",
    ],
    description:
      "Demo non-sponsored monitoring and education resource.",
    action: "View information",
  },
];

/* =========================================================
   MATCHING
   ========================================================= */

function getClinicalMatches(reportText = "") {
  const text = String(reportText).toLowerCase();

  return clinicalMatches
    .map((product) => {
      const matchedKeywords = product.matchKeywords.filter((keyword) =>
        text.includes(keyword.toLowerCase())
      );

      return {
        ...product,
        matchedKeywords,
        matchCount: matchedKeywords.length,
      };
    })
    .filter((product) => product.matchCount > 0)
    .sort((a, b) => {
      /*
       * IMPORTANT:
       * Sponsorship does NOT affect clinical matching.
       * The number of matched keywords determines the ordering.
       */
      return b.matchCount - a.matchCount;
    })
    .slice(0, 8);
}

/* =========================================================
   CLINICAL MATCH SIDEBAR
   ========================================================= */

function ClinicalMatches({ reportText }) {
  const [notice, setNotice] = useState(null);

  const matches = useMemo(
    () => getClinicalMatches(reportText),
    [reportText]
  );

  const requestSample = (product) => {
    setNotice(
      `Demo request created for ${product.name}.`
    );
  };

  const viewInformation = (product) => {
    setNotice(
      `Demo information panel opened for ${product.name}.`
    );
  };

  return (
    <aside className="clinical-matches-panel">

      {/* HEADER */}

      <div className="clinical-panel-header">

        <div className="clinical-panel-icon">
          ✦
        </div>

        <div>
          <div className="clinical-panel-title">
            Clinical matches
          </div>

          <div className="clinical-panel-subtitle">
            Related therapies & resources
          </div>
        </div>

      </div>

      {/* DISCLOSURE */}

      <div className="sponsor-disclosure">

        <div className="sponsor-disclosure-title">
          Check out some of the matches
        </div>

        <div className="sponsor-disclosure-text">
          Products marked{" "}
          <span className="inline-sponsor">
            Sponsor
          </span>{" "}
          participate in sponsored placement.
        </div>

      </div>

      {/* NOTICE */}

      {notice && (
        <div className="clinical-action-notice">
          <span>✓</span>
          {notice}
          <button onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}

      {/* MATCHES */}

      <div className="clinical-match-list">

        {matches.length === 0 ? (
          <div className="no-matches">
            <div className="no-matches-icon">
              ○
            </div>

            <strong>
              No matches found
            </strong>

            <span>
              No relevant products or resources were
              identified from this report.
            </span>
          </div>
        ) : (
          matches.map((product) => (

            <div
              className={
                product.sponsor
                  ? "clinical-match-card sponsored"
                  : "clinical-match-card"
              }
              key={product.id}
            >

              {/* PRODUCT TOP */}

              <div className="clinical-match-top">

                <div className="product-identity">

                  <div className="product-icon">
                    {product.category === "Sleep"
                      ? "◒"
                      : product.category === "Cardiovascular"
                      ? "♡"
                      : product.category === "Respiratory"
                      ? "◌"
                      : "✦"}
                  </div>

                  <div>
                    <div className="clinical-match-name">
                      {product.name}
                    </div>

                    <div className="clinical-match-category">
                      {product.category}
                      {" · "}
                      {product.type}
                    </div>
                  </div>

                </div>

                {product.sponsor && (
                  <span className="sponsor-badge">
                    Sponsor
                  </span>
                )}

              </div>

              {/* DESCRIPTION */}

              <p className="clinical-match-description">
                {product.description}
              </p>

              {/* MATCHED TERMS */}

              <div className="match-label">
                Matches this report
              </div>

              <div className="match-tags">

                {product.matchedKeywords
                  .slice(0, 4)
                  .map((keyword) => (

                    <span
                      className="match-tag"
                      key={keyword}
                    >
                      {keyword}
                    </span>

                  ))}

              </div>

              {/* ACTION */}

              <button
                className={
                  product.sponsor
                    ? "sample-button"
                    : "info-button"
                }
                onClick={() =>
                  product.sponsor
                    ? requestSample(product)
                    : viewInformation(product)
                }
              >

                {product.sponsor ? (
                  <>
                    <span>＋</span>
                    Order patient sample
                  </>
                ) : (
                  <>
                    View information
                    <span>→</span>
                  </>
                )}

              </button>

            </div>

          ))
        )}

      </div>

      {/* FOOTER */}

      <div className="clinical-disclaimer">

        <strong>Clinical note</strong>

        <span>
          Matches are based on report terminology and are
          not prescribing or treatment recommendations.
        </span>

      </div>

    </aside>
  );
}

/* =========================================================
   PATIENT LOGIN
   ========================================================= */

function PatientLogin({ patientId, credentials }) {
  const [issued, setIssued] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const issue = async () => {
    setBusy(true);
    setError(null);

    try {
      setIssued(
        await api.post(`/patients/${patientId}/credentials`)
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">

      <div className="card-head">

        <span className="card-title">
          Patient login
        </span>

        <span className="card-note">
          {credentials.lastLoginAt
            ? `last signed in ${new Date(
                credentials.lastLoginAt.replace(" ", "T") + "Z"
              ).toLocaleDateString("en-GB")}`
            : "never signed in"}
        </span>

      </div>

      <div className="cred-row">
        <span className="muted">
          Username
        </span>

        <code>
          {credentials.username}
        </code>
      </div>

      <div className="cred-row">

        <span className="muted">
          Password
        </span>

        <span>
          {credentials.hasPassword ? (
            credentials.mustChangePassword ? (
              <span className="badge badge-moderate">
                temporary — not yet changed
              </span>
            ) : (
              <span className="badge badge-stable">
                set by patient
              </span>
            )
          ) : (
            <span className="badge badge-high">
              not set
            </span>
          )}
        </span>

      </div>

      {issued && (
        <div
          className="notice"
          style={{ marginTop: "0.7rem" }}
        >

          <strong>
            Temporary password — shown once.
          </strong>

          <div className="cred-box">

            <div className="cred-row">
              <span className="muted">
                Username
              </span>

              <code>
                {issued.username}
              </code>
            </div>

            <div className="cred-row">
              <span className="muted">
                Password
              </span>

              <code>
                {issued.tempPassword}
              </code>
            </div>

          </div>

          <p
            className="field-hint"
            style={{ marginTop: "0.5rem" }}
          >
            Give this to the patient directly.
            They'll be asked to choose their own on
            first sign-in.
          </p>

        </div>
      )}

      {error && (
        <div
          className="error-box"
          style={{ marginTop: "0.7rem" }}
        >
          {error}
        </div>
      )}

      <div
        className="btn-row"
        style={{ marginTop: "0.85rem" }}
      >

        <button
          onClick={issue}
          disabled={busy}
        >
          {busy ? (
            <span className="spinner" />
          ) : null}

          {credentials.hasPassword
            ? "Reset password"
            : "Generate password"}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   MAIN PATIENT PAGE
   ========================================================= */

export default function Patient() {

  const { id } = useParams();
  const navigate = useNavigate();
  const colors = useThemeColors();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {

    try {
      setData(
        await api.get(`/patients/${id}`)
      );
    } catch (e) {
      setError(e.message);
    }

  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <main className="page">
        <div className="error-box">
          {error}
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page">
        <p className="muted">
          Loading…
        </p>
      </main>
    );
  }

  const {
    patient,
    partner,
    points,
    moodLogs,
    journals,
    partnerMoodLogs,
    partnerJournals,
    compliance,
    reports,
    severityBucket,
    credentials,
  } = data;

  /* =====================================================
     REPORT
     ===================================================== */

  const generateReport = async () => {

    setGenerating(true);
    setError(null);

    try {

      const { report } = await api.post(
        `/patients/${patient.id}/reports`
      );

      navigate(`/reports/${report.id}`);

    } catch (e) {

      setError(e.message);
      setGenerating(false);

    }
  };

  /* =====================================================
     REGENERATE
     ===================================================== */

  const regenerate = async () => {

    setRegenerating(true);

    try {

      await api.post(
        `/patients/${patient.id}/regenerate`,
        {}
      );

      await load();

    } catch (e) {

      setError(e.message);

    } finally {

      setRegenerating(false);

    }
  };

  /* =====================================================
     BUILD LOCAL REPORT TEXT
     ===================================================== */

  const reportMatchingText = `
    sleep
    sleep quality
    sleep duration
    resting heart rate
    heart rate
    HRV
    heart rate variability
    breathing rate
    breathing
    mood
    stress
    anxiety
    energy
    cardiovascular
    respiratory
  `;

  return (

    <main className="page">

      <style>{`

        /* =================================================
           CLINICAL MATCHES
           ================================================= */

        .clinical-matches-panel {
          background:
            linear-gradient(
              180deg,
              #f0f7ff 0%,
              #f7fbff 42%,
              #ffffff 100%
            );

          border: 1px solid #cfe1f4;
          border-radius: 18px;

          padding: 1rem;

          box-shadow:
            0 8px 28px rgba(36, 91, 145, 0.08);

          align-self: start;

          position: sticky;
          top: 1rem;

          min-width: 0;
        }

        .clinical-panel-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          padding-bottom: 0.9rem;
          border-bottom: 1px solid #dce9f5;
        }

        .clinical-panel-icon {
          width: 38px;
          height: 38px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #dceeff;
          color: #1769aa;

          font-size: 1.1rem;
          font-weight: 700;
        }

        .clinical-panel-title {
          font-size: 0.95rem;
          font-weight: 750;
          color: #17324d;
          letter-spacing: -0.01em;
        }

        .clinical-panel-subtitle {
          margin-top: 2px;
          font-size: 0.72rem;
          color: #71869a;
        }

        .sponsor-disclosure {
          margin: 0.85rem 0;

          padding: 0.75rem;

          border-radius: 11px;

          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #d9e8f5;
        }

        .sponsor-disclosure-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: #29465e;
        }

        .sponsor-disclosure-text {
          margin-top: 0.25rem;

          font-size: 0.68rem;
          line-height: 1.45;

          color: #72869a;
        }

        .inline-sponsor {
          display: inline-block;

          padding: 1px 5px;

          border-radius: 4px;

          background: #fff1cc;
          color: #855e00;

          font-size: 0.63rem;
          font-weight: 750;
        }

        .clinical-action-notice {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          padding: 0.6rem 0.7rem;
          margin-bottom: 0.7rem;

          border-radius: 9px;

          background: #e8f7ef;
          border: 1px solid #bfe5cf;

          color: #226340;

          font-size: 0.7rem;
        }

        .clinical-action-notice span {
          font-weight: 800;
        }

        .clinical-action-notice button {
          margin-left: auto;

          padding: 0;
          width: 20px;
          height: 20px;

          border: 0;
          background: transparent;

          color: #5d806d;

          cursor: pointer;
        }

        .clinical-match-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .clinical-match-card {
          background: #ffffff;

          border: 1px solid #dce8f2;
          border-radius: 13px;

          padding: 0.8rem;

          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            border-color 0.15s ease;
        }

        .clinical-match-card:hover {
          transform: translateY(-1px);

          border-color: #b9d2e8;

          box-shadow:
            0 5px 16px rgba(33, 82, 125, 0.08);
        }

        .clinical-match-card.sponsored {
          border-left: 3px solid #e4b847;
        }

        .clinical-match-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .product-identity {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-width: 0;
        }

        .product-icon {
          flex: 0 0 auto;

          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #eef6fd;
          color: #2777b6;

          font-size: 0.85rem;
        }

        .clinical-match-name {
          color: #203b52;

          font-size: 0.8rem;
          font-weight: 750;
        }

        .clinical-match-category {
          margin-top: 2px;

          color: #7b8d9d;

          font-size: 0.61rem;
          line-height: 1.25;
        }

        .sponsor-badge {
          flex: 0 0 auto;

          padding: 3px 6px;

          border-radius: 5px;

          background: #fff1ca;
          color: #806000;

          font-size: 0.57rem;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .clinical-match-description {
          margin: 0.65rem 0 0;

          color: #617588;

          font-size: 0.68rem;
          line-height: 1.45;
        }

        .match-label {
          margin-top: 0.65rem;

          color: #8a9aa8;

          font-size: 0.59rem;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .match-tags {
          display: flex;
          flex-wrap: wrap;

          gap: 4px;

          margin-top: 0.3rem;
        }

        .match-tag {
          padding: 3px 6px;

          border-radius: 5px;

          background: #f1f6fa;
          color: #587187;

          font-size: 0.58rem;
        }

        .sample-button,
        .info-button {
          width: 100%;

          margin-top: 0.7rem;

          min-height: 32px;

          border-radius: 7px;

          font-size: 0.67rem;
          font-weight: 700;

          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;

          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .sample-button {
          border: 1px solid #2d78b8;
          background: #2d78b8;
          color: white;
        }

        .sample-button:hover {
          background: #24679f;
        }

        .info-button {
          border: 1px solid #cfdeea;
          background: #f8fbfd;
          color: #35617f;
        }

        .info-button:hover {
          background: #edf5fa;
          border-color: #b9d1e2;
        }

        .no-matches {
          padding: 2rem 1rem;

          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;

          color: #718598;
        }

        .no-matches-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .no-matches strong {
          color: #405b70;
          font-size: 0.75rem;
        }

        .no-matches span {
          margin-top: 0.3rem;
          max-width: 220px;

          font-size: 0.65rem;
          line-height: 1.4;
        }

        .clinical-disclaimer {
          margin-top: 0.85rem;
          padding-top: 0.75rem;

          border-top: 1px solid #dce8f2;

          display: flex;
          flex-direction: column;
          gap: 3px;

          font-size: 0.59rem;
          line-height: 1.4;

          color: #8294a4;
        }

        .clinical-disclaimer strong {
          color: #657b8d;
          font-size: 0.6rem;
        }

        /* =================================================
           THREE COLUMN DESKTOP LAYOUT
           ================================================= */

        .patient-content-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.6fr)
            minmax(260px, 0.75fr)
            minmax(280px, 0.8fr);

          gap: 1rem;

          align-items: start;
        }

        .patient-main-column {
          min-width: 0;
        }

        .patient-secondary-column {
          min-width: 0;
        }

        /* =================================================
           TABLET
           ================================================= */

        @media (max-width: 1180px) {

          .patient-content-layout {
            grid-template-columns:
              minmax(0, 1.45fr)
              minmax(270px, 0.8fr);
          }

          .clinical-matches-panel {
            grid-column: 1 / -1;

            position: static;
          }

          .clinical-match-list {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        /* =================================================
           PHONE
           ================================================= */

        @media (max-width: 760px) {

          .patient-content-layout {
            display: flex;
            flex-direction: column;
          }

          .patient-main-column,
          .patient-secondary-column,
          .clinical-matches-panel {
            width: 100%;
          }

          .clinical-matches-panel {
            position: static;

            margin-top: 0.2rem;

            border-radius: 14px;

            padding: 0.85rem;
          }

          .clinical-match-list {
            display: flex;
            flex-direction: column;
          }

          .clinical-panel-header {
            padding-bottom: 0.75rem;
          }

        }

      `}</style>

      {/* =================================================
          BACK
          ================================================= */}

      <Link
        to="/"
        className="back-link"
      >
        ← Back to patients
      </Link>

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="page-head">

        <div>

          <h1>
            {patient.name}
          </h1>

          <p className="page-sub">

            @{patient.username}
            {" · "}
            {patient.age} years
            {" · "}
            {patient.email}

            {partner
              ? ` · observer: ${partner.name}`
              : ""}

          </p>

          {patient.description && (
            <p
              className="page-sub"
              style={{
                maxWidth: 680,
                marginTop: "0.5rem",
              }}
            >
              {patient.description}
            </p>
          )}

        </div>

        <div className="btn-row">

          <button
            onClick={regenerate}
            disabled={regenerating}
            title="Roll a fresh simulated dataset"
          >

            {regenerating ? (
              <span className="spinner" />
            ) : null}

            Regenerate data

          </button>

          <button
            className="btn-primary"
            onClick={generateReport}
            disabled={generating}
          >

            {generating ? (
              <span className="spinner" />
            ) : null}

            {generating
              ? "Analysing…"
              : "Generate report"}

          </button>

        </div>

      </div>

      {/* =================================================
          SUMMARY
          ================================================= */}

      <div
        className="grid grid-3"
        style={{
          marginBottom: "1rem",
        }}
      >

        <StatTile
          label="Baseline health score"
          value={patient.health_score}
          unit="/10"
          foot={bucketLabel[severityBucket]}
          tone={
            severityBucket === "high"
              ? "critical"
              : severityBucket === "stable"
              ? "good"
              : undefined
          }
        />

        <StatTile
          label="Average mood"
          value={fmt(
            mean(
              points.map(
                (p) => p.mood_score
              )
            )
          )}
          unit="/10"
          foot={`${points.length} tracked days`}
        />

        <StatTile
          label="Average sleep"
          value={fmt(
            mean(
              points.map(
                (p) => p.sleep_hours
              )
            )
          )}
          unit="h"
          foot={`Quality ${fmt(
            mean(
              points.map(
                (p) => p.sleep_quality
              )
            ),
            0
          )}/100`}
        />

        <StatTile
          label="Resting heart rate"
          value={fmt(
            mean(
              points.map(
                (p) => p.resting_hr
              )
            ),
            0
          )}
          unit="bpm"
          foot={`HRV ${fmt(
            mean(
              points.map(
                (p) => p.hrv
              )
            ),
            0
          )}ms`}
        />

      </div>

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <div className="patient-content-layout">

        {/* =================================================
            REPORT / CHARTS
            ================================================= */}

        <div className="patient-main-column">

          <div className="stack">

            {/* MOOD */}

            <div className="card">

              <div className="card-head">

                <span className="card-title">
                  Mood, anxiety and energy
                </span>

                <span className="card-note">
                  Self-reported, 1–10
                </span>

              </div>

              <div className="chart-scroll">
                <MoodChart points={points} />
              </div>

            </div>

            {/* SLEEP */}

            <div className="card">

              <div className="card-head">

                <span className="card-title">
                  Sleep duration
                </span>

                <span className="card-note">
                  Hours per night
                </span>

              </div>

              <div className="chart-scroll">
                <SleepChart points={points} />
              </div>

            </div>

            {/* PHYSIOLOGICAL */}

            <div className="card">

              <div className="card-head">

                <span className="card-title">
                  Physiological signals
                </span>

                <span className="card-note">
                  Separate scales, shown separately
                </span>

              </div>

              <div className="grid grid-2">

                <div>

                  <p className="card-note">
                    Resting heart rate (bpm)
                  </p>

                  <MetricChart
                    points={points}
                    dataKey="resting_hr"
                    name="Resting HR"
                    unit="bpm"
                    color={colors.series2}
                  />

                </div>

                <div>

                  <p className="card-note">
                    Heart rate variability (ms)
                  </p>

                  <MetricChart
                    points={points}
                    dataKey="hrv"
                    name="HRV"
                    unit="ms"
                    color={colors.series3}
                  />

                </div>

                <div>

                  <p className="card-note">
                    Breathing rate (per min)
                  </p>

                  <MetricChart
                    points={points}
                    dataKey="breathing_rate"
                    name="Breathing"
                    unit="/min"
                    color={colors.series1}
                  />

                </div>

                <div>

                  <p className="card-note">
                    Sleep quality (0–100)
                  </p>

                  <MetricChart
                    points={points}
                    dataKey="sleep_quality"
                    name="Sleep quality"
                    domain={[0, 100]}
                    color={colors.series4}
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SECONDARY
            ================================================= */}

        <div className="patient-secondary-column">

          <div className="stack">

            <ComplianceCard
              compliance={compliance}
            />

            <PatientLogin
              patientId={patient.id}
              credentials={credentials}
            />

            {/* REPORTS */}

            <div className="card">

              <div className="card-head">

                <span className="card-title">
                  Reports
                </span>

                <span className="card-note">
                  {reports.length} generated
                </span>

              </div>

              {reports.length === 0 ? (

                <p
                  className="muted"
                  style={{
                    fontSize: "0.85rem",
                  }}
                >
                  No reports yet. Generate one to
                  get an AI briefing on this window.
                </p>

              ) : (

                reports.map((r) => (

                  <Link
                    key={r.id}
                    to={`/reports/${r.id}`}
                    className="patient-row"
                  >

                    <div>

                      <div
                        className="patient-name"
                        style={{
                          fontSize: "0.88rem",
                        }}
                      >

                        {new Date(
                          r.generated_at.replace(
                            " ",
                            "T"
                          ) + "Z"
                        ).toLocaleString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}

                      </div>

                      {/* <div className="patient-meta">
                        {r.model_used}
                      </div> */}

                    </div>

                    <span className="muted">
                      →
                    </span>

                  </Link>

                ))

              )}

            </div>

            {/* JOURNAL */}

            <div className="card">

              <div className="card-head">

                <span className="card-title">
                  Journal & mood check-ins
                </span>

                <span className="card-note">
                  {journals.length} entries
                </span>

              </div>

              <JournalTimeline
                journals={journals}
                moodLogs={moodLogs}
              />

            </div>

          </div>

        </div>

        {/* =================================================
            PHARMA / CLINICAL MATCHES
            ================================================= */}

        <ClinicalMatches
          reportText={reportMatchingText}
        />

      </div>

      {/* =================================================
          PARTNER
          ================================================= */}

      {partner && (

        <div
          className="card"
          style={{
            marginTop: "1rem",
          }}
        >

          <div className="card-head">

            <span className="card-title">
              Patient vs {partner.name}
            </span>

            <span className="card-note">
              Highlighted rows differ by 3+ points
            </span>

          </div>

          <div
            className="chart-scroll"
            style={{
              marginBottom: "1rem",
            }}
          >

            <MoodComparisonChart
              patientLogs={moodLogs}
              partnerLogs={partnerMoodLogs}
              partnerName={partner.name}
            />

          </div>

          <PartnerCompare
            patientMoods={moodLogs}
            partnerMoods={partnerMoodLogs}
            patientJournals={journals}
            partnerJournals={partnerJournals}
            partnerName={partner.name}
          />

        </div>

      )}

    </main>
  );
}