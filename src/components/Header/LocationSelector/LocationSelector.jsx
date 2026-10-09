import { useEffect, useRef, useState } from "react";
import "./LocationSelector.css";

function LocationSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [pincode, setPincode] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [status, setStatus] = useState("");
    const [isDetecting, setIsDetecting] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setStatus("Location detection is not supported by this browser.");
            return;
        }

        setIsDetecting(true);
        setStatus("");
        navigator.geolocation.getCurrentPosition(
            () => {
                setSelectedLocation("GPS location detected");
                setIsDetecting(false);
                setIsOpen(false);
            },
            (error) => {
                const messages = {
                    1: "Location permission was denied. Enter your pincode instead.",
                    2: "Your location could not be determined. Please try again.",
                    3: "Location detection timed out. Please try again.",
                };
                setStatus(messages[error.code] || "Could not detect your location. Please try again.");
                setIsDetecting(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    };

    const submitPincode = (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(pincode)) {
            setStatus("Enter a valid 6-digit pincode.");
            return;
        }

        setSelectedLocation(pincode);
        setStatus("");
        setIsOpen(false);
    };

    return (
        <div className="location-selector" ref={containerRef}>
            <button
                type="button"
                className="location-selector__trigger"
                aria-label={selectedLocation ? `Delivery location: ${selectedLocation}` : "Select delivery location"}
                aria-expanded={isOpen}
                aria-controls="delivery-location-menu"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="material-symbols-outlined location-selector__icon" aria-hidden="true">
                    location_on
                </span>
                {selectedLocation ? <span className="location-selector__value">{selectedLocation}</span> : null}
            </button>

            {isOpen ? (
                <section className="location-selector__dropdown" id="delivery-location-menu" aria-label="Select Delivery Location">
                    <h2>Select Delivery Location</h2>
                    <p className="location-selector__description">
                        Auto-detect your pincode or enter it manually.
                    </p>

                    <button
                        type="button"
                        className="location-selector__option"
                        onClick={detectLocation}
                        disabled={isDetecting}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">my_location</span>
                        <span>
                            <strong>{isDetecting ? "Detecting location..." : "Detect automatically"}</strong>
                            <small>Use my current location (GPS)</small>
                        </span>
                    </button>

                    <form className="location-selector__form" onSubmit={submitPincode}>
                        <label htmlFor="delivery-pincode">Enter pincode manually</label>
                        <div className="location-selector__input-row">
                            <input
                                id="delivery-pincode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="postal-code"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                placeholder="Type your pincode"
                                value={pincode}
                                onChange={(event) => {
                                    setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                                    setStatus("");
                                }}
                            />
                            <button type="submit" disabled={pincode.length !== 6}>Apply</button>
                        </div>
                    </form>
                    {status ? <p className="location-selector__status" role="status">{status}</p> : null}
                </section>
            ) : null}
        </div>
    );
}

export default LocationSelector;
