import React, { useState } from "react";

const alerts = [
  {
    id: 1,
    type: "appointment",
    title: "Book an appointment?",
    message:
      "We noticed a change in your recent health patterns. Dr. Shanti is available tomorrow for a consultation.",
    primary: "Book appointment",
    secondary: "No thanks",
  },
  {
    id: 2,
    type: "sleep",
    title: "Review your sleep?",
    message:
      "Your sleep pattern has been different from your recent baseline.",
    primary: "Review sleep",
    secondary: "Dismiss",
  },
  {
    id: 3,
    type: "heart",
    title: "Review your heart-rate trend?",
    message:
      "Your recent readings look different from your usual pattern.",
    primary: "View trend",
    secondary: "Dismiss",
  },
  {
    id: 4,
    type: "checkin",
    title: "How are you feeling today?",
    message:
      "It's been a little while since your last health check-in.",
    primary: "Check in",
    secondary: "Not now",
  },
  {
    id: 5,
    type: "doctor",
    title: "Talk to your care team?",
    message:
      "Your recent wearable data may be worth discussing with your care team.",
    primary: "Contact doctor",
    secondary: "Dismiss",
  },
  {
    id: 6,
    type: "activity",
    title: "Your activity was lower yesterday",
    message:
      "Your activity level was below your recent average.",
    primary: "View activity",
    secondary: "Dismiss",
  },
  {
    id: 7,
    type: "sleep",
    title: "Your sleep schedule changed",
    message:
      "Your bedtime has varied more than usual this week.",
    primary: "View sleep",
    secondary: "Dismiss",
  },
  {
    id: 8,
    type: "data",
    title: "New health data available",
    message:
      "Your Apple Watch has synced new readings to your dashboard.",
    primary: "View data",
    secondary: "Dismiss",
  },
  {
    id: 9,
    type: "appointment",
    title: "Follow-up available",
    message:
      "Dr. Shanti has consultation times available this week.",
    primary: "See times",
    secondary: "Not now",
  },
  {
    id: 10,
    type: "checkin",
    title: "Complete today's check-in?",
    message:
      "A quick check-in can help your care team understand your recent trends.",
    primary: "Start check-in",
    secondary: "Later",
  },
];

export default function Notifications() {
  const [visibleAlerts, setVisibleAlerts] = useState(alerts);

  const dismissAlert = (id) => {
    setVisibleAlerts((current) =>
      current.filter((alert) => alert.id !== id)
    );
  };

  return (
    <div className="notifications-card">
      <div className="notifications-header">
        <div>
          <span className="notifications-title">
            Alerts
          </span>

          <div className="notifications-subtitle">
            Things that may need your attention
          </div>
        </div>

        {visibleAlerts.length > 0 && (
          <span className="notifications-count">
            {visibleAlerts.length}
          </span>
        )}
      </div>

      <div className="notifications-list">
        {visibleAlerts.map((alert) => (
          <div
            className={`notification-alert notification-${alert.type}`}
            key={alert.id}
          >
            <div className="notification-alert-icon">
              {alert.type === "appointment" && "◷"}
              {alert.type === "sleep" && "☾"}
              {alert.type === "heart" && "♥"}
              {alert.type === "checkin" && "✓"}
              {alert.type === "doctor" && "✚"}
              {alert.type === "activity" && "↗"}
              {alert.type === "data" && "⌁"}
            </div>

            <div className="notification-alert-content">
              <div className="notification-alert-title">
                {alert.title}
              </div>

              <div className="notification-alert-message">
                {alert.message}
              </div>

              <div className="notification-alert-actions">
                <button
                  className="notification-primary-button"
                  onClick={() => {
                    console.log(
                      `Action selected: ${alert.primary}`
                    );
                  }}
                >
                  {alert.primary}
                </button>

                <button
                  className="notification-secondary-button"
                  onClick={() => dismissAlert(alert.id)}
                >
                  {alert.secondary}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleAlerts.length === 0 && (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            ✓
          </div>

          <strong>
            You're all caught up
          </strong>

          <span>
            No alerts need your attention right now.
          </span>
        </div>
      )}
    </div>
  );
}
