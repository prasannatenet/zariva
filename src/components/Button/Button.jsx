import "./Button.css";

const Button = ({
    text = "Button",
    icon,
    materialIcon,
    type = "button",
    onClick,
    disabled = false,
    fullWidth = false,
    className = "",
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`common-button ${fullWidth ? "common-button--full" : ""} ${className}`}
        >
            <span className="common-button__fill"></span>

            <span className="common-button__text">
                {text}
            </span>

            {icon && (
                <i className={`bi ${icon} common-button__icon`}></i>
            )}

            {materialIcon && (
                <span className="material-symbols-outlined common-button__icon">
                    {materialIcon}
                </span>
            )}
        </button>
    );
};

export default Button;