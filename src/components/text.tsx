import { Text, type TextProps } from "react-native";

import { twMerge } from "tailwind-merge";

type HTextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

type HTextWeight =
	| "thin"
	| "extralight"
	| "light"
	| "normal"
	| "medium"
	| "semibold"
	| "bold"
	| "extrabold"
	| "black";

type HTextColor =
	| "foreground"
	| "foreground-secondary"
	| "muted"
	| "primary"
	| "danger"
	| "success"
	| "warning"
	| "white"
	| "black";

type HTextProps = TextProps & {
	className?: string;
	size?: HTextSize;
	weight?: HTextWeight;
	color?: HTextColor;
};

const SIZE_CLASS: Record<HTextSize, string> = {
	xs: "text-xs",
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
	"3xl": "text-3xl",
	"4xl": "text-4xl",
};

const FONT_CLASS: Record<HTextWeight, string> = {
	thin: "font-sans",
	extralight: "font-sans",
	light: "font-sans",
	normal: "font-sans",
	medium: "font-sans-medium",
	semibold: "font-sans-semibold",
	bold: "font-sans-bold",
	extrabold: "font-sans-extrabold",
	black: "font-sans-extrabold",
};

const COLOR_CLASS: Record<HTextColor, string> = {
	foreground: "text-foreground",
	"foreground-secondary": "text-foreground-secondary",
	muted: "text-muted",
	primary: "text-primary",
	danger: "text-danger",
	success: "text-success",
	warning: "text-warning",
	white: "text-white",
	black: "text-black",
};

export default function HText({
	children,
	className,
	size = "base",
	weight = "normal",
	color = "foreground",
	...props
}: HTextProps) {
	return (
		<Text
			className={twMerge(
				FONT_CLASS[weight],
				SIZE_CLASS[size],
				COLOR_CLASS[color],
				className,
			)}
			{...props}
		>
			{children}
		</Text>
	);
}
