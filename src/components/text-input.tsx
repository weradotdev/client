import { TextInput, TextInputProps, View } from "react-native";

import HText from "@/components/text";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const SIZE_CLASS = {
	sm: "min-h-10 py-2.5 text-sm",
	md: "min-h-12 py-3.5 text-base",
	lg: "min-h-14 py-4 text-lg",
} as const;

export default function HTextInput({
	label,
	labelClassName,
	errors,
	helperText,
	leftIcon,
	rightIcon,
	rightAction,
	size = "md",
	className,
	...props
}: TextInputProps & {
	label?: string;
	labelClassName?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	rightAction?: ReactNode;
	errors?: any[];
	helperText?: string;
	size?: keyof typeof SIZE_CLASS;
}) {
	const hasErrors = errors && errors.length > 0;

	return (
		<View className="flex-1 gap-2">
			{(label || rightAction) && (
				<View className="flex-row items-center justify-between">
					{label ? (
						<HText
							className={twMerge(
								"text-sm font-sans-medium",
								labelClassName,
							)}
						>
							{label}
						</HText>
					) : (
						<View />
					)}
					
					{rightAction}
				</View>
			)}

			<View className="flex-row items-center relative">
				{leftIcon && (
					<View className="absolute left-4 z-10">{leftIcon}</View>
				)}

				<TextInput
					className={twMerge(
						"flex-1 pl-4 bg-gray-100 border border-primary/30 rounded-2xl font-sans",
						SIZE_CLASS[size],
						leftIcon && "pl-12",
						rightIcon && "pr-12",
						className,
					)}
					placeholderTextColor="#9ca3af"
					{...props}
				/>

				{rightIcon && (
					<View className="absolute right-4 z-10">{rightIcon}</View>
				)}
			</View>

			{hasErrors && (
				<HText size="xs" color="danger">
					{errors.join(", ")}
				</HText>
			)}
		</View>
	);
}
