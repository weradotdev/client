import HText from "@/components/text";
import { View } from "react-native";

export interface StatsCardProps {
	value: string | number;
	label: string;
	variant?: "default" | "accent";
}

export function StatsCard({ value, label, variant = "default" }: StatsCardProps) {
	const bgClass = variant === "accent" ? "bg-primary/20" : "bg-primary/10";
	const valueClass = variant === "accent" ? "text-primary" : "text-white";

	return (
		<View className={`flex-1 min-w-[28%] rounded-xl ${bgClass} px-3 py-4`}>
			<HText size="2xl" weight="bold" className={valueClass}>
				{value}
			</HText>
			<HText size="sm" className={variant === "accent" ? "text-primary/70" : "text-gray-200"}>
				{label}
			</HText>
		</View>
	);
}
