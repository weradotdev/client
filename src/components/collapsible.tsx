import Animated, { FadeIn } from "react-native-reanimated";
import { Pressable, Text, View } from "react-native";
import { PropsWithChildren, useState } from "react";

import { SymbolView } from "expo-symbols";
import { useCSSVariable } from "uniwind";

export function Collapsible({
	children,
	title,
}: PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const foreground = useCSSVariable("--color-foreground") as string;

	return (
		<View className="bg-background">
			<Pressable
				className="flex-row items-center gap-2 active:opacity-70"
				onPress={() => setIsOpen(value => !value)}
			>
				<View className="w-10 h-10 rounded-xl justify-center items-center bg-muted">
					<SymbolView
						name={
							{
								ios: "chevron.right",
								android: "chevron_right",
								web: "chevron_right",
							} as any
						}
						size={14}
						weight="bold"
						tintColor={foreground}
						style={{
							transform: [
								{ rotate: isOpen ? "-90deg" : "90deg" },
							],
						}}
					/>
				</View>

				<Text className="text-sm font-medium text-foreground">
					{title}
				</Text>
			</Pressable>

			{isOpen && (
				<Animated.View entering={FadeIn.duration(200)}>
					<View className="mt-4 ml-4 p-4 rounded-lg bg-muted">
						{children}
					</View>
				</Animated.View>
			)}
		</View>
	);
}
