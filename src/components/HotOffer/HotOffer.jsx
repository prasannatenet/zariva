import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import "./HotOffer.css";

const SALE_STARTS_IN = 2 * 60 * 60 + 18 * 60 + 30;

function HotOffer() {
    const navigate = useNavigate();
    const [saleStartsAt] = useState(() => Date.now() + SALE_STARTS_IN * 1000);
    const [secondsRemaining, setSecondsRemaining] = useState(SALE_STARTS_IN);

    useEffect(() => {
        const updateCountdown = () => {
            setSecondsRemaining(Math.max(0, Math.ceil((saleStartsAt - Date.now()) / 1000)));
        };

        updateCountdown();
        const timerId = window.setInterval(updateCountdown, 1000);
        return () => window.clearInterval(timerId);
    }, [saleStartsAt]);

    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    return (
        <section className="hot-offer" aria-labelledby="hot-offer-title">
            <div className="hot-offer__copy">
                <span className="hot-offer__eyebrow">Limited time offer</span>
                <h2 id="hot-offer-title">Hot Offer</h2>
                <h3>Diamond Rings &amp; Fine Jewellery</h3>
                <p>Find a little extra sparkle for your next special moment.</p>
                <div className="hot-offer__timer-wrap">
                    <span className="hot-offer__timer-label">
                        {secondsRemaining > 0 ? "Sale starts in" : "Sale has started"}
                    </span>
                    <div
                        className="hot-offer__timer"
                        role="timer"
                        aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}
                    >
                        {[hours, minutes, seconds].map((part, index) => (
                            <span className="hot-offer__time-part" key={index}>
                                {String(part).padStart(2, "0")}
                            </span>
                        ))}
                    </div>
                    <span className="hot-offer__timer-units" aria-hidden="true">
                        <span>Hours</span>
                        <span>Minutes</span>
                        <span>Seconds</span>
                    </span>
                </div>
            </div>
        </section>
    );
}

export default HotOffer;
