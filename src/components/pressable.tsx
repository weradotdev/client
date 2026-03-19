import { ActivityIndicator, Pressable, PressableProps } from "react-native";

import HText from "@/components/text";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function HPressable({
	label,
	labelClassName,
	helperText,
	leftIcon,
	rightIcon,
	className,
	variant = "primary",
	size = "md",
	children,
	isLoading = false,
	...props
}: PressableProps & {
	label?: string;
	labelClassName?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	helperText?: string;
	variant?: "primary" | "secondary" | "tertiary" | "outline";
	size?: "sm" | "md" | "lg" | "xl" | "icon";
	isLoading?: boolean;
}) {
	return (
		<Pressable
			className={twMerge(
				"w-full flex-row items-center justify-center gap-2 rounded-2xl",
				variant === "primary" && "bg-primary",
				variant === "secondary" && "bg-gray-500",
				variant === "tertiary" && "bg-gray-100",
				variant === "outline" && "bg-transparent border border-primary",
				size === "sm" && "py-2 px-4",
				size === "md" && "py-3 px-6",
				size === "lg" && "py-4 px-8",
				size === "xl" && "py-5 px-10",
				size === "icon" && "w-12 h-12 rounded-full p-0",
				className,
			)}
			disabled={isLoading || props.disabled}
			{...props}
		>
			{leftIcon}

			{isLoading ? (
				<ActivityIndicator
					size="small"
					color={variant === "outline" || variant === "tertiary" ? undefined : "#fff"}
				/>
			) : null}

			{!isLoading &&
				((children as any) ??
					(label ? (
						<HText
							className={twMerge(
								"text-white text-lg",
								variant === "outline" && "text-primary",
								variant === "tertiary" && "text-foreground",
								labelClassName,
							)}
						>
							{label}
						</HText>
					) : null))}

			{rightIcon}
		</Pressable>
	);
}
