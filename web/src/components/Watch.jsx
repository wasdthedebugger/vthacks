import React from "react";

function Watch() {
  // Safe defaults so this component works as a drop-in.
  const compliance = {
    logged: 6,
    expected: 7,
    score: 86,
  };

  return (
    <div className="watch-card">
      <div className="watch-card-head">
        <div>
          <div className="watch-device-name">
            Apple Watch Series 11
          </div>
        </div>

        <span className="watch-connected">
          <span className="watch-status-dot" />
          Connected
        </span>
      </div>

      <div className="watch-main">
        {/* Apple Watch */}
        <div className="watch-visual">
          <div className="watch-strap watch-strap-top" />

          <div className="watch-strap watch-strap-bottom" />

          <div className="watch-body">
            <div className="watch-screen">
              <div className="watch-time">10:09</div>

              <div className="watch-today">
                TODAY
              </div>

              <div className="watch-ring">
                <div className="watch-ring-inner">
                  <span className="watch-heart">♥</span>

                  <strong className="watch-bpm">
                    72
                  </strong>

                  <small className="watch-bpm-label">
                    BPM
                  </small>
                </div>
              </div>
            </div>

            <div className="watch-crown" />
          </div>
        </div>

        {/* Wearable information */}
        <div className="watch-info">
          {/* Battery */}
          <div className="watch-info-item">
            <div className="watch-label">
              Battery
            </div>

            <div className="watch-battery-row">
              <div className="watch-battery">
                <div className="watch-battery-fill" />
                <div className="watch-battery-tip" />
              </div>

              <strong className="watch-value">
                78%
              </strong>
            </div>
          </div>

          {/* Last active */}
          <div className="watch-info-item">
            <div className="watch-label">
              Last active
            </div>

            <strong className="watch-value watch-large-value">
              Just now
            </strong>
          </div>

          {/* Data */}
          <div className="watch-info-item">
            <div className="watch-label">
              Today's data
            </div>

            <strong className="watch-value watch-large-value">
              {compliance.logged}/{compliance.expected} days
            </strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="watch-footer">
        {/* <span>
          {compliance.score}% data logged
        </span> */}

        <span className="watch-synced">
          ● Synced
        </span>
      </div>
    </div>
  );
}

export default Watch;