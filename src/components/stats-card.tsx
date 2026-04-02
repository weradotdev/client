import HText from "@/components/text";
import { Href } from "expo-router";
import { View } from "react-native";

export function StatsCard({
	value,
	label,
	variant = "default",
}: {
	value: string | number;
	label: string;
	variant?: "default" | "accent";
	href?: Href;
}) {
	const bgClass = variant === "accent" ? "bg-primary/20" : "bg-primary/10";
	const valueClass = variant === "accent" ? "text-primary" : "text-white";

	return (
		<View className={`flex-1 min-w-[28%] rounded-xl ${bgClass} px-3 py-4`}>
			<HText size="2xl" weight="bold" className={valueClass}>
				{value}
			</HText>
			<HText
				size="sm"
				className={
					variant === "accent" ? "text-primary/70" : "text-gray-200"
				}
			>
				{label}
			</HText>
		</View>
	);
}
