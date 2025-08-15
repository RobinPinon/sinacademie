import React from "react";
import "./Button.scss";

export default function Button({
	children,
	type = "button",
	onClick,
	disabled = false,
	className = "",
}) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`btn ${className} ${disabled ? "btn--disabled" : ""}`}
		>
			{children}
		</button>
	);
}

