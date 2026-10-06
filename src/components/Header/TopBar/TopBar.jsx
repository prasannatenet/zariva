import "./TopBar.css";

function TopBar() {
    return (
        <div className="top-bar">
            {/* Left Section */}
            <div className="top-bar__left">
                <a href="/" className="top-bar__link">
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.4098 12.3488L15.0198 7.32881C14.9298 7.00881 15.1098 6.67881 15.4198 6.57881L20.3798 4.96881" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.5198 19.7888C17.5198 20.7088 20.7698 18.9288 21.7798 15.8188C22.7898 12.7088 21.1698 9.44882 18.1698 8.53882" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.91992 12.4988H11.9499" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.91992 6.62878H11.9499" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.91992 18.3688H11.9499" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <span>Exchange & Return</span>
                </a>
                <a href="/" className="top-bar__link">
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5001 2.34375C10.6919 2.34375 8.9578 3.06204 7.67923 4.34061C6.40067 5.61918 5.68237 7.35329 5.68237 9.16146C5.68237 14.5 10.8907 20.9375 12.2501 22.5104C12.2892 22.5556 12.3376 22.5919 12.392 22.6167C12.4463 22.6416 12.5054 22.6545 12.5652 22.6545C12.625 22.6545 12.6841 22.6416 12.7384 22.6167C12.7928 22.5919 12.8412 22.5556 12.8803 22.5104C14.2084 20.9479 19.3178 14.5 19.3178 9.16146C19.3178 7.35329 18.5995 5.61918 17.3209 4.34061C16.0424 3.06204 14.3082 2.34375 12.5001 2.34375Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.1666 6.06772V9.89584C10.1638 10.204 10.2222 10.5097 10.3382 10.7952C10.4542 11.0807 10.6257 11.3404 10.8426 11.5592C11.0595 11.7781 11.3177 11.9519 11.6022 12.0704C11.8866 12.189 12.1918 12.25 12.4999 12.25C12.8081 12.25 13.1132 12.189 13.3977 12.0704C13.6822 11.9519 13.9403 11.7781 14.1573 11.5592C14.3742 11.3404 14.5456 11.0807 14.6617 10.7952C14.7777 10.5097 14.836 10.204 14.8333 9.89584V6.06772" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.8333 9.91666V12.25" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.1667 9.91666V15.2396" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Track Your Order</span>
                </a>
            </div>

            <div className="top-bar__right">
                <button type="button" className="top-bar__link">
                    <span className="material-symbols-outlined">
                        location_on
                    </span>

                    <span>Pincode</span>
                </button>
            </div>
        </div>
    );
}

export default TopBar;