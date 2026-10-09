import { useEffect, useState } from "react";
import "./TopBar.css";
import AnnouncementBar from "../AnnouncementBar/AnnouncementBar";

const SALE_COUNTDOWN_SECONDS = 10 * 60 * 60 + 56 * 60 + 20;

function TopBar() {
    const [saleEndsAt] = useState(() => Date.now() + SALE_COUNTDOWN_SECONDS * 1000);
    const [secondsRemaining, setSecondsRemaining] = useState(SALE_COUNTDOWN_SECONDS);

    useEffect(() => {
        const updateCountdown = () => {
            setSecondsRemaining(Math.max(0, Math.ceil((saleEndsAt - Date.now()) / 1000)));
        };

        updateCountdown();
        const intervalId = window.setInterval(updateCountdown, 1000);

        return () => window.clearInterval(intervalId);
    }, [saleEndsAt]);

    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    return (
        <div className="top-bar">
            {/* Left Section */}
            <div className="top-bar__left">
                <button type="button" className="live-rates" aria-label="Live rates">
                    <div>
                        <span className="live-rates__label">Live Rates</span>
                        <span className="material-symbols-outlined live-rates__chevron" aria-hidden="true">
                            keyboard_arrow_down
                        </span>
                    </div>
                </button>
            </div>

            <AnnouncementBar />

            <div className="top-bar__saleAlert">
                {secondsRemaining > 0 ? (
                    <>
                        <span className="top-bar__saleAlert-label">Live sale starts in</span>
                        <span className="top-bar__countdown" role="timer" aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}>
                            <span className="top-bar__countdown-unit">{String(hours).padStart(2, "0")}</span>
                            <span className="top-bar__countdown-separator" aria-hidden="true">:</span>
                            <span className="top-bar__countdown-unit">{String(minutes).padStart(2, "0")}</span>
                            <span className="top-bar__countdown-separator" aria-hidden="true">:</span>
                            <span className="top-bar__countdown-unit">{String(seconds).padStart(2, "0")}</span>
                        </span>
                    </>
                ) : (
                    <span className="top-bar__saleAlert-label">Live sale started</span>
                )}
            </div>
        </div>
    );
}

export default TopBar;