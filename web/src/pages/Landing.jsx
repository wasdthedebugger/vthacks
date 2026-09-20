import { useEffect } from "react";
import { Link } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────────────────
   DEMO VIDEO — paste the embed URL here and the placeholder is replaced by
   the player. Use the *embed* form of the URL, not the watch/share link:

     YouTube   https://www.youtube.com/embed/VIDEO_ID
     Vimeo     https://player.vimeo.com/video/VIDEO_ID
     Loom      https://www.loom.com/embed/VIDEO_ID

   Leave it as null and the section renders the placeholder frame instead.
   ────────────────────────────────────────────────────────────────────────── */
const DEMO_VIDEO_URL = null;
const DEMO_VIDEO_TITLE = "Persist.health — walkthrough";

/* One month of one patient, from the worked briefing further down: seventeen
   days recorded, thirteen blank. `null` is a day with no check-in — drawn as a
   gap and never interpolated, because the missing days are half the point. The
   same array drives the hero chart and the coverage calendar, so the two can
   never drift apart. */
const WINDOW = [5, 4, null, 6, 4, null, null, 5, null, 4, 3, null, 5, null, null, 2, 2, 1, null, 2, null, 3, 1, null, null, 4, null, 4, 3, null];
const FLAGGED = [17, 22]; // zero-based: 18 Jul and 23 Jul
const RECORDED = WINDOW.filter((v) => v != null).length;
const COVERAGE = Math.round((RECORDED / WINDOW.length) * 100);

const X0 = 30;
const X1 = 592;
const Y_TOP = 18;
const Y_BOT = 136;
const px = (i) => X0 + (i / (WINDOW.length - 1)) * (X1 - X0);
const py = (v) => Y_BOT - ((v - 1) / 9) * (Y_BOT - Y_TOP);

/* Consecutive runs of recorded days, so the line breaks where the data does. */
function runs(series) {
  const out = [];
  let current = [];
  series.forEach((v, i) => {
    if (v == null) {
      if (current.length > 1) out.push(current);
      current = [];
    } else {
      current.push([px(i), py(v)]);
    }
  });
  if (current.length > 1) out.push(current);
  return out;
}

function MonthChart() {
  return (
    <svg viewBox="0 0 600 176" role="img" aria-labelledby="chart-title chart-desc" className="lp-svg">
      <title id="chart-title">Thirty days of a self-rated symptom score for one patient</title>
      <desc id="chart-desc">
        Seventeen days carry a check-in and thirteen do not. The score falls to 1 on 18 and 23 July, the
        two nights with almost no sleep.
      </desc>

      <line x1={X0} y1={Y_BOT + 8} x2={X1} y2={Y_BOT + 8} stroke="var(--lp-rule-strong)" strokeWidth="1" />
      <line x1={X0} y1={py(5)} x2={X1} y2={py(5)} stroke="var(--lp-rule)" strokeWidth="1" strokeDasharray="2 5" />
      <text x="0" y={Y_TOP + 4} className="lp-svg-axis">10</text>
      <text x="0" y={py(5) + 4} className="lp-svg-axis">5</text>
      <text x="0" y={Y_BOT + 4} className="lp-svg-axis">1</text>

      {runs(WINDOW).map((run, i) => (
        <polyline
          key={i}
          className="lp-line"
          style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          pathLength="1"
          points={run.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="var(--lp-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {WINDOW.map((v, i) =>
        v == null ? (
          <line key={i} x1={px(i)} y1={Y_BOT + 15} x2={px(i)} y2={Y_BOT + 21} stroke="var(--lp-rule-strong)" strokeWidth="1.5" />
        ) : (
          <circle
            key={i}
            className="lp-dot"
            style={{ animationDelay: `${0.5 + i * 0.012}s` }}
            cx={px(i)}
            cy={py(v)}
            r={FLAGGED.includes(i) ? 4.5 : 3}
            fill={FLAGGED.includes(i) ? "var(--critical)" : "var(--lp-accent)"}
          />
        )
      )}

      {/* Annotation sits above the flagged point: below it would collide with
          the missing-day ticks and the date axis. */}
      <line x1={px(17)} y1={104} x2={px(17)} y2={py(1) - 8} stroke="var(--critical)" strokeWidth="1" strokeDasharray="2 3" />
      <text x={px(17)} y={97} className="lp-svg-note" textAnchor="middle">18 Jul — 0.4 h sleep, score 1</text>
      <text x={X0} y={168} className="lp-svg-axis">2 Jul</text>
      <text x={X1} y={168} className="lp-svg-axis" textAnchor="end">31 Jul</text>
    </svg>
  );
}

/* The same month as a coverage grid. Filled cells were recorded; hollow ones
   are the days the clinician has nothing for. */
function CoverageCalendar() {
  return (
    <div className="lp-cal">
      <div className="lp-cal-grid" role="img" aria-label={`${RECORDED} of ${WINDOW.length} days recorded — ${COVERAGE} per cent coverage`}>
        {WINDOW.map((v, i) => (
          <span
            key={i}
            className={
              v == null ? "lp-cell lp-cell-empty" : FLAGGED.includes(i) ? "lp-cell lp-cell-flag" : "lp-cell"
            }
            title={`${i + 2} Jul — ${v == null ? "no check-in" : `score ${v}`}`}
          />
        ))}
      </div>
      <p className="lp-cal-legend">
        <strong>{COVERAGE}% coverage</strong> — {RECORDED} of {WINDOW.length} days recorded.
        <span className="lp-cal-key">
          <span className="lp-cell" /> logged
          <span className="lp-cell lp-cell-empty" /> nothing recorded
        </span>
      </p>
    </div>
  );
}

/* Alternating full-bleed bands are what stop the page reading as one long
   document. `alt` paints the raised surface; `tint` is the sunk one. */
function Band({ id, tone = "", eyebrow, title, sub, children }) {
  return (
    <section className={`lp-band ${tone}`} id={id}>
      <div className="lp-band-inner">
        {eyebrow && <p className="lp-eyebrow">{eyebrow}</p>}
        {title && <h2 className="lp-h2">{title}</h2>}
        {sub && <p className="lp-sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}

export default function Landing() {
  // The page mounts after the browser has already tried to resolve the URL
  // fragment, so a link straight to /#briefing would otherwise land at the top.
  // Instant rather than smooth: a deep link should arrive, not animate there.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }));
  }, []);

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#top" className="brand">
            <span className="brand-mark">P</span>
            <span>Persist.health</span>
          </a>
          <nav className="lp-nav-links">
            <a href="#how">How it works</a>
            <a href="#demo">Demo</a>
            <a href="#briefing">The briefing</a>
            <a href="#safety">Safety</a>
            <a href="#honest">What's missing</a>
          </nav>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </header>

      <main id="top">
        {/* ---------- hero ---------- */}
        <section className="lp-hero">
          <div className="lp-band-inner">
            <p className="lp-eyebrow">Between-visit patient monitoring · clinician-led</p>
            <h1 className="lp-h1">
              Fifty minutes a month. Then you ask them to remember the other forty-three thousand.
            </h1>
            <div className="lp-hero-grid">
              <p className="lp-lede">
                Patients log a short check-in between visits. Before the next appointment, the clinician
                opens a briefing that names the days that mattered — with the evidence attached to every claim.
              </p>
              <div className="lp-cta-row">
                <a href="#demo" className="btn btn-primary btn-lg">
                  Watch the walkthrough
                </a>
                <Link to="/login" className="btn btn-lg">
                  Sign in
                </Link>
              </div>
            </div>

            {/* The whole pitch in one figure: the retelling against the record. */}
            <figure className="lp-split">
              <div className="lp-split-recall">
                <p className="lp-split-label">
                  What you hear in the room <span className="lp-tagline">illustrative</span>
                </p>
                <blockquote className="lp-quote">
                  “Yeah, it's been… alright? There was a bad patch, maybe a couple of weeks ago. I don't
                  really remember.”
                </blockquote>
                <p className="lp-split-foot">Thirty days, reconstructed on the spot, by someone whose memory of the month is coloured by how they feel this morning.</p>
              </div>

              <div className="lp-split-record">
                <p className="lp-split-label">What the thirty days actually recorded</p>
                <MonthChart />
                <p className="lp-split-foot">
                  <span className="lp-swatch lp-swatch-line" /> self-rated symptom score
                  <span className="lp-swatch lp-swatch-crit" /> the days the briefing opened on
                  <span className="lp-swatch lp-swatch-gap" /> no check-in
                </p>
              </div>
            </figure>

            <dl className="lp-stats">
              <div>
                <dt>50<span>min</span></dt>
                <dd>of contact in a typical month of ongoing care</dd>
              </div>
              <div>
                <dt>4<span>streams</span></dt>
                <dd>check-in, journal, physiology, observer</dd>
              </div>
              <div>
                <dt>100<span>%</span></dt>
                <dd>of claims carry the date or number they came from</dd>
              </div>
              <div>
                <dt>0<span>diagnoses</span></dt>
                <dd>no dose advice, no treatment advice, by construction</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ---------- honesty strip ---------- */}
        <div className="lp-strip">
          <div className="lp-band-inner lp-strip-inner">
            <span className="lp-strip-tag">Research prototype</span>
            <p>
              Not a medical device. Not clinically validated. Not safe for real patient care yet — and we
              are specific about why.
            </p>
            <a href="#honest" className="lp-strip-link">
              What's missing →
            </a>
          </div>
        </div>

        {/* ---------- the problem ---------- */}
        <Band
          id="problem"
          eyebrow="The problem"
          title="Memory is a poor instrument for a month of life"
          sub="A patient seen monthly summarises four weeks of internal experience from recall — and that summary is the evidence the next month of care is planned on. Recent days and extreme days dominate; the ordinary ones compress."
        >
          <div className="lp-cards lp-cards-3">
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Order is lost</h3>
              <p>Not "sleep was bad" but which nights, in what sequence, and what happened around them.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>The other account is lost</h3>
              <p>What a partner noticed — which routinely diverges from self-report in ways that matter.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>The silence is lost</h3>
              <p>The days nothing was recorded at all. Often the most informative days of the month.</p>
            </article>
          </div>
        </Band>

        {/* ---------- how it works ---------- */}
        <Band id="how" tone="lp-band-alt" eyebrow="How it works" title="One loop, four steps">
          <ol className="lp-steps">
            <li>
              <span className="lp-step-n">1</span>
              <h3>The patient logs, in their own words</h3>
              <p>A daily symptom rating and free tags, plus journal entries whenever they want to write. Under a minute a day.</p>
            </li>
            <li>
              <span className="lp-step-n">2</span>
              <h3>Four streams merge into one timeline</h3>
              <p>Check-ins, journal, physiology and an observer's parallel account — every row tagged with where it came from.</p>
            </li>
            <li>
              <span className="lp-step-n">3</span>
              <h3>The clinician generates a briefing</h3>
              <p>Summary, findings and things to ask about, each carrying its dates and values — plus how much of the window was actually recorded.</p>
            </li>
            <li>
              <span className="lp-step-n">4</span>
              <h3>The visit starts somewhere useful</h3>
              <p>Not ten minutes reconstructing the month. "Tell me about the eighteenth" — and the clinician can check that date in seconds.</p>
            </li>
          </ol>

          <div className="lp-feature">
            <div>
              <h3 className="lp-feature-title">Coverage is reported, never scored</h3>
              <p>
                A quiet fortnight at 40% coverage is not evidence of a quiet fortnight. The briefing is
                instructed to frame a gap as a limit of the data, never as the patient failing at something —
                the reason a check-in was missed is usually the clinically interesting part, and calling it a
                failure makes it less likely to get discussed.
              </p>
            </div>
            <CoverageCalendar />
          </div>
        </Band>

        {/* ---------- video ---------- */}
        <Band
          id="demo"
          tone="lp-band-tint"
          eyebrow="See it running"
          title="Three minutes, end to end"
          sub="A patient logging a check-in, the clinician's view of the window, and a briefing generated live."
        >
          <div className="lp-video">
            {DEMO_VIDEO_URL ? (
              <iframe
                src={DEMO_VIDEO_URL}
                title={DEMO_VIDEO_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="lp-video-placeholder">
                <span className="lp-play" aria-hidden="true" />
                <p className="lp-video-title">Walkthrough video</p>
                <p className="lp-video-sub">Coming shortly.</p>
              </div>
            )}
          </div>
        </Band>

        {/* ---------- the briefing: the centrepiece ---------- */}
        <Band
          id="briefing"
          eyebrow="The briefing"
          title="What the clinician reads before the session"
          sub="Real output from the running system, in the components that render it — not a mockup. The patient record is synthetic; the analysis is not."
        >
          <div className="lp-screen">
            <div className="lp-screen-bar">
              <span className="brand">
                <span className="brand-mark">P</span>
                <span>
                  Persist.health <span className="brand-sub">· clinical decision support</span>
                </span>
              </span>
              <span className="lp-screen-user">Dr Smith</span>
            </div>

            <div className="lp-screen-body">
              <div className="lp-brief-head">
                <div>
                  <h3 className="lp-brief-name">Daniel Okafor, 34</h3>
                  <p className="lp-brief-meta">2 Jul – 31 Jul 2026 · 30 days · coverage 57% (13 days missing)</p>
                </div>
                <span className="badge badge-high">High severity · 2/10</span>
              </div>

              <div className="ai-block">
                <div className="ai-flag">
                  <span className="dot" style={{ background: "var(--ai-edge)" }} /> AI interpretation — summary
                </div>
                <p className="lp-brief-body">
                  Sleep remained generally low (average ≈4.2 hrs) with extreme lows of 0.4 hrs on 2026-07-18
                  and 2.2 hrs on 2026-07-23. Self-rated symptom severity fluctuated between 1 and 7, frequently
                  falling to 1–3, especially mid-month and late month. Pain repeatedly reached 8–10. Partner
                  observations often rated the patient lower than self-report and noted reduced activity or
                  low energy on days such as 2026-07-06, 2026-07-11, 2026-07-17 and 2026-07-28.
                </p>
              </div>

              <div className="ai-block" style={{ marginTop: "0.9rem" }}>
                <div className="ai-flag">
                  <span className="dot" style={{ background: "var(--ai-edge)" }} /> AI interpretation — findings
                </div>
                <div className="insight">
                  <div className="insight-title">
                    Severe sleep disruption coincides with high symptom severity and partner-observed reduced activity
                  </div>
                  <div className="insight-detail">
                    Sleep dropped to 0.4 hrs on July 18 and 2.2 hrs on July 23, with self-rated symptom severity
                    of 1 on both days and partner notes of reduced activity or "low energy".
                  </div>
                  <div className="insight-evidence">
                    sleep_hours: 0.4 on 2026-07-18, 2.2 on 2026-07-23 · symptom_1_10: 1 on both dates · partner
                    journal 2026-07-17, 2026-07-28 describing reduced activity
                  </div>
                </div>
                <div className="insight">
                  <div className="insight-title">Partner observations frequently rate the patient lower than self-report</div>
                  <div className="insight-detail">
                    On days such as July 13 (self score 5 vs partner 4) and July 28 (self 4 vs partner 3) the
                    partner rated the patient lower, often coinciding with self-reported fatigue or low-energy tags.
                  </div>
                  <div className="insight-evidence">
                    patient symptom_1_10: 5 on 2026-07-13, 4 on 2026-07-28 · partner rating: 4 and 3 · patient
                    tags [ok] on 2026-07-28 vs partner tags [tired, low]
                  </div>
                </div>
              </div>

              <div className="ai-block" style={{ marginTop: "0.9rem" }}>
                <div className="ai-flag">
                  <span className="dot" style={{ background: "var(--ai-edge)" }} /> AI interpretation — suggested
                  discussion points
                </div>
                <p className="lp-brief-body">
                  "Consider exploring discrepancies between self-report and partner observations on days such as
                  July 13 and July 28 to understand gaps in awareness."
                </p>
              </div>

              <p className="lp-brief-screen">
                <span aria-hidden="true">✓</span> Diagnostic-language screen: <strong>PASSED</strong> — 0 matches
              </p>
            </div>
          </div>

          <div className="lp-cards lp-cards-2 lp-cards-flush">
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Nobody wrote a rule for that</h3>
              <p>
                No code says "compare the two accounts and flag divergence". It is an emergent read of two
                parallel streams — and the kind of thing that is easy to miss scrolling thirty days of charts.
              </p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Every claim carries receipts</h3>
              <p>
                A clinician who distrusts a finding can check it against the recorded data in seconds. That is
                the only reasonable posture toward a language model in a clinical setting.
              </p>
            </article>
          </div>
        </Band>

        {/* ---------- safety ---------- */}
        <Band
          id="safety"
          tone="lp-band-alt"
          eyebrow="Safety"
          title="It does not diagnose. That is the construction, not a promise."
          sub="The model is scoped to describing patterns. It may never name, suggest, imply or rule out a diagnosis, never touch medication or dose, and never call a pattern an illness."
        >
          <div className="lp-cards lp-cards-3">
            <article className="lp-card">
              <p className="lp-card-n">01</p>
              <h3>The instruction</h3>
              <p>The primary control. A fixed output schema — summary, evidence-linked findings, discussion points — with no field a diagnosis would fit in.</p>
            </article>
            <article className="lp-card">
              <p className="lp-card-n">02</p>
              <h3>A keyword screen</h3>
              <p>Every briefing is scanned for diagnostic and prescribing language. A flagged one is still shown, with a banner naming the wording.</p>
            </article>
            <article className="lp-card">
              <p className="lp-card-n">03</p>
              <h3>Visible separation</h3>
              <p>Model interpretation renders in marked blocks, distinct from recorded data. You saw both above — those are the real components.</p>
            </article>
          </div>

          <p className="lp-inline-note lp-inline-warn">
            <strong>And the honest limit:</strong> a keyword screen catches vocabulary, not meaning. A model
            can describe a diagnosis perfectly while avoiding every listed word. The clinician reading the
            briefing is the control that matters.
          </p>
        </Band>

        {/* ---------- provenance ---------- */}
        <Band
          id="provenance"
          eyebrow="Provenance"
          title="Every row knows where it came from"
          sub="The prototype ships a data generator, because it needed patient histories before it had patients. Fabricated clinical data that looks real is the most dangerous thing in the system — so nothing is anonymous about its own origin."
        >
          <div className="lp-tags">
            <article className="lp-tagcard lp-tagcard-real">
              <code>self-reported</code>
              <p>The patient, through the portal</p>
              <span className="badge badge-stable">Real</span>
            </article>
            <article className="lp-tagcard lp-tagcard-real">
              <code>imported</code>
              <p>Validated JSON from another system</p>
              <span className="badge badge-stable">Real</span>
            </article>
            <article className="lp-tagcard lp-tagcard-synth">
              <code>generated</code>
              <p>The simulator, on explicit request only</p>
              <span className="badge badge-high">Synthetic</span>
            </article>
          </div>

          <p className="lp-inline-note">
            <strong>A new patient starts empty.</strong> The generator never fires on its own, and the tag is
            queryable — so "how much of this record is real" has an exact answer. Its journal pool holds 48
            entries, so generated text repeats across a month. If the same sentence appears three times,
            you are reading synthetic data.
          </p>
        </Band>

        {/* ---------- two views ---------- */}
        <Band
          id="views"
          tone="lp-band-alt"
          eyebrow="Two views"
          title="Patients see their data. Not the clinician's read of it."
          sub="A patient who can see their severity rating, or their partner's parallel account, is answering a different question when they log a check-in. Showing it would change what is reported — and the report is the measurement."
        >
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th scope="col">Element</th>
                  <th scope="col">Clinician</th>
                  <th scope="col">Patient</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Own check-ins, journal, charts</td><td className="lp-yes">Yes</td><td className="lp-yes">Yes</td></tr>
                <tr><td>Check-in coverage and gaps</td><td className="lp-yes">Yes</td><td className="lp-yes">Yes</td></tr>
                <tr><td>Clinician's baseline severity rating</td><td className="lp-yes">Yes</td><td className="lp-no">No</td></tr>
                <tr><td>Partner / observer stream</td><td className="lp-yes">Yes</td><td className="lp-no">No</td></tr>
                <tr><td>AI briefing</td><td className="lp-yes">Yes</td><td className="lp-no">No</td></tr>
              </tbody>
            </table>
          </div>
          <p className="lp-inline-note">
            <strong>We are not settled on this.</strong> It is the patient's health record, professional
            opacity has a poor history in medicine, and in some jurisdictions there is a legal right of
            access regardless. It should be decided with patient representatives, not engineers.
          </p>
        </Band>

        {/* ---------- value ---------- */}
        <Band
          id="value"
          eyebrow="The bet"
          title="What we think it buys"
          sub="Hypotheses the design exists to test. None of this has been demonstrated for this system."
        >
          <div className="lp-cards lp-cards-3">
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Session time spent better</h3>
              <p>The briefing arrives with dates already identified, so the first ten minutes go somewhere else.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Divergence made visible</h3>
              <p>Specific dates turn "I think they under-report" into something discussable in the room.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Caseload triage</h3>
              <p>Coverage and trend direction as a defensible way to decide who to contact sooner. A scheduling aid, not a judgement.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Patients see their pattern</h3>
              <p>Seeing that a bad week was a bad week and not a bad life supports the self-monitoring most structured care programs teach.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Research-grade structure</h3>
              <p>Timestamped, provenance-tagged, exportable longitudinal data with explicit missingness.</p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Honest data quality</h3>
              <p>Coverage travels with every briefing, so partial data is never presented as complete.</p>
            </article>
          </div>
        </Band>

        {/* ---------- what's missing ---------- */}
        <Band
          id="honest"
          tone="lp-band-alt"
          eyebrow="What's missing"
          title="What has to be true before this touches real care"
          sub="The prototype runs on real infrastructure — a live database, a live model, a portal producing genuine entries. Here is the distance between that and something a service could use."
        >
          <div className="lp-blocker">
            <p className="lp-blocker-tag">Blocking</p>
            <h3>There is no risk detection and no escalation route</h3>
            <p>
              A patient can write something indicating acute risk into the journal at two in the morning, and
              the system will file it quietly and show it at the next appointment — which may be four weeks
              away. A monitoring tool implies someone is watching. If nobody is, it is worse than nothing,
              because a patient may disclose to the app instead of to a person.
            </p>
            <p>
              Before any deployment: crisis resources at the point of writing, a stated monitoring window
              including what is <em>not</em> watched, a triage route to a human, and an audited escalation
              protocol agreed with the service. None of it is technically hard. All of it is mandatory.
            </p>
          </div>

          <div className="lp-cards lp-cards-2">
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>The physiology is simulated</h3>
              <p>
                Real device data means consumer wearables via vendor APIs. Three caveats: they are not
                clinical instruments, ownership selects for income and age, and missingness is not random —
                a device goes uncharged during exactly the weeks a patient is least well.
              </p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>The scales are not validated</h3>
              <p>
                The 1–10 ratings have no psychometric properties, cut-offs or norms. A defensible design
                keeps a short daily item for resolution and adds a periodic validated instrument for
                measurement — a clinical decision, not an engineering one.
              </p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Automation bias is real</h3>
              <p>
                A fluent briefing is persuasive regardless of accuracy, and may anchor thinking before the
                clinician forms their own view. Showing it <em>after</em> their own review is worth testing.
              </p>
            </article>
            <article className="lp-card">
              <span className="lp-card-rule" />
              <h3>Monitoring may cost more than it buys</h3>
              <p>
                Daily logging plus an observer stream can feel like surveillance, suppressing honest
                reporting or altering the clinical relationship. The design should be prepared to lose
                that question.
              </p>
            </article>
          </div>

          <details className="lp-details">
            <summary>The validation pathway we would have to run — and the gate on each phase</summary>
            <ol className="lp-phases">
              <li>
                <p className="lp-phase-n">Phase 1</p>
                <h4>Technical and analytic validation</h4>
                <p>No patients. Synthetic records with known ground truth: does the briefing find planted patterns, how often does it fabricate ones that aren't there, how stable is it across repeated runs on identical input?</p>
                <p className="lp-gate">Gate — a quantified fabrication rate. Nothing proceeds without that number.</p>
              </li>
              <li>
                <p className="lp-phase-n">Phase 2</p>
                <h4>Clinical face validity</h4>
                <p>Clinicians blind-rate briefings against the records. Include briefings built from records with no real signal, to test whether the system manufactures narrative from noise.</p>
                <p className="lp-gate">Gate — clinicians can tell informative briefings from empty ones.</p>
              </li>
              <li>
                <p className="lp-phase-n">Phase 3</p>
                <h4>Feasibility and acceptability</h4>
                <p>A small consenting cohort with full safety scaffolding. Adherence over weeks, attrition, patient-reported burden, effect on the alliance, clinician time cost.</p>
                <p className="lp-gate">Gate — adherence that survives the novelty period, and no harm to the alliance.</p>
              </li>
              <li>
                <p className="lp-phase-n">Phase 4</p>
                <h4>Clinical utility</h4>
                <p>Only now a controlled question: does the briefing change clinical decisions, and do those changes improve outcomes against standard care?</p>
                <p className="lp-gate">Gate — the honest possibility of a null result, reported.</p>
              </li>
            </ol>
            <p className="lp-details-note">
              Phase 1 is the one most often skipped and the one that matters most here: a model that
              confabulates a date or a correlation produces output that is fluent, specific, evidence-shaped
              and wrong — the hardest kind of error for a busy reader to catch.
            </p>
          </details>

          <details className="lp-details">
            <summary>How it is built</summary>
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr>
                    <th scope="col">Layer</th>
                    <th scope="col">Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Interface</td><td>React, with charting for longitudinal display; print stylesheet for the one-page summary</td></tr>
                  <tr><td>Service</td><td>Node.js / Express REST API</td></tr>
                  <tr><td>Storage</td><td>MySQL 8, prefixed tables so it can share a schema with other applications</td></tr>
                  <tr><td>Language model</td><td>Any OpenAI-compatible chat-completions endpoint; provider-agnostic by design</td></tr>
                  <tr><td>Resilience</td><td>Ordered model fallback with per-attempt timeout; deterministic local analysis if every provider fails</td></tr>
                  <tr><td>Interchange</td><td>Documented JSON import with per-row validation, replay-safe writes and full batch revert</td></tr>
                </tbody>
              </table>
            </div>
            <p className="lp-details-note">
              Two details with clinical consequences. <strong>Briefings snapshot their evidence</strong> — a
              saved briefing stores the data it analysed, so re-importing or regenerating never retroactively
              alters something already read and acted on. And <strong>there is a deterministic fallback</strong>:
              if every model provider fails, the briefing comes from a local statistical pass over the
              patient's actual data, labelled as non-model output, so an outage never leaves a clinician with
              an empty screen mid-session.
            </p>
          </details>

          <details className="lp-details">
            <summary>What we measure, and the ranges enforced at the import boundary</summary>
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Unit / range</th>
                    <th scope="col">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>sleep_hours</code></td><td className="lp-num-cell">0–24 h</td><td>Total sleep per night</td></tr>
                  <tr><td><code>sleep_quality</code></td><td className="lp-num-cell">0–100</td><td>Composite restfulness index</td></tr>
                  <tr><td><code>resting_hr</code></td><td className="lp-num-cell">20–220 bpm</td><td>Resting heart rate</td></tr>
                  <tr><td><code>hrv</code></td><td className="lp-num-cell">0–300 ms</td><td>Heart rate variability</td></tr>
                  <tr><td><code>breathing_rate</code></td><td className="lp-num-cell">2–60 /min</td><td>Respiration rate</td></tr>
                  <tr><td><code>mood_score</code></td><td className="lp-num-cell">1–10</td><td>Daily wellbeing rating</td></tr>
                  <tr><td><code>anxiety_score</code></td><td className="lp-num-cell">1–10</td><td>Daily symptom intensity rating</td></tr>
                  <tr><td><code>energy_score</code></td><td className="lp-num-cell">1–10</td><td>Self-rated energy</td></tr>
                </tbody>
              </table>
            </div>
            <p className="lp-details-note">
              An out-of-range value is rejected per row, with the exact path to the offending field, and the
              rest of the file still imports.
            </p>
          </details>
        </Band>

        {/* ---------- close ---------- */}
        <section className="lp-close">
          <div className="lp-band-inner">
            <h2 className="lp-h2">Sign in</h2>
            <p className="lp-sub">
              One form serves both roles and routes you to the right view. Patient logins are issued by the
              clinician — there is no self-registration, by design.
            </p>
            <div className="lp-cta-row">
              <Link to="/login" className="btn btn-primary btn-lg">
                Sign in
              </Link>
              <a href="#demo" className="btn btn-lg">
                Watch the walkthrough
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-band-inner">
          <div className="lp-footer-main">
            <div className="lp-footer-brand">
              <div className="brand">
                <span className="brand-mark">P</span>
                <span>Persist.health</span>
              </div>
              <p>
                Between-visit patient monitoring for clinicians. Patients log the days; the briefing
                names them.
              </p>
            </div>

            <nav className="lp-footer-col">
              <h4>The product</h4>
              <a href="#how">How it works</a>
              <a href="#demo">Walkthrough</a>
              <a href="#briefing">The briefing</a>
              <a href="#views">Two views</a>
            </nav>

            <nav className="lp-footer-col">
              <h4>The evidence</h4>
              <a href="#safety">Safety</a>
              <a href="#provenance">Provenance</a>
              <a href="#value">What it could buy</a>
              <a href="#honest">What's missing</a>
            </nav>

            <nav className="lp-footer-col">
              <h4>Access</h4>
              <Link to="/login">Sign in</Link>
              <a href="#problem">The problem</a>
            </nav>
          </div>

          <div className="lp-compliance">
            <p className="lp-compliance-tag">Compliance</p>
            <p>
              <strong>HIPAA compliance is the goal. This prototype is not compliant.</strong> It has
              in-memory sessions, no field-level encryption, no audit trail, no rate limiting, and it sends
              patient text to a third-party model provider. Health records are also special category data
              under UK/EU GDPR. Do not put real patient data into it in its current form.
            </p>
          </div>

          <div className="lp-footer-bottom">
            <p className="lp-footer-legal">
              © {new Date().getFullYear()} Persist.health · Research prototype · Not a medical device
            </p>
            <p className="lp-footer-note">
              Not clinically validated; no claim of clinical efficacy is made. The briefing shown above is
              real system output analysing a synthetic patient record. Where established concepts are named —
              recall bias, ecological momentary assessment, software as a medical device — review the
              underlying literature independently before relying on any of it.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
