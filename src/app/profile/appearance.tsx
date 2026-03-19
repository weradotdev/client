import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react-native";
import { Moon02Icon, Preferences, Sun02Icon } from "@hugeicons/core-free-icons";
import { Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

import HText from "@/components/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { useMemo } from "react";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: {
	value: ThemeOption;
	label: string;
	subtitle: string;
	icon: IconSvgElement;
}[] = [
	{
		value: "light",
		label: "Light",
		subtitle: "Always use light theme",
		icon: Sun02Icon,
	},
	{
		value: "dark",
		label: "Dark",
		subtitle: "Always use dark theme",
		icon: Moon02Icon,
	},
	{
		value: "system",
		label: "System",
		subtitle: "Match device setting",
		icon: Preferences,
	},
];

export default function AppearanceScreen() {
	const primaryColor = useCSSVariable("--color-primary");
	const { theme, hasAdaptiveThemes } = useUniwind();
	const activeTheme = (hasAdaptiveThemes ? "system" : theme) as ThemeOption;

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					title: "Appearance",
					headerTitleAlign: "center" as const,
					// headerLeft: () => (
					// 	<HeaderBackButton
					// 		tintColor={String(primaryColor)}
					// 		onPress={() => router.back()}
					// 	/>
					// ),
					headerStyle: { backgroundColor: "#ffffff" },
					headerTintColor: String(primaryColor),
				}}
			/>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName="px-4 pb-40"
				showsVerticalScrollIndicator={false}
			>
				<HText size="sm" color="muted" className="mb-3">
					Current: {activeTheme}
				</HText>

				<View className="flex-row gap-3 mb-6">
					{THEME_OPTIONS.map(opt => (
						<Pressable
							key={opt.value}
							onPress={() => Uniwind.setTheme(opt.value)}
							className={`flex-1 px-4 py-4 rounded-xl items-center border-2 gap-2 ${
								activeTheme === opt.value
									? "bg-primary border-primary"
									: "bg-primary/10 border-border"
							}`}
						>
							<HugeiconsIcon
								icon={opt.icon}
								size={24}
								color={
									activeTheme === opt.value
										? "white"
										: "black"
								}
								strokeWidth={1.5}
							/>

							<HText
								size="sm"
								weight="medium"
								className={
									activeTheme === opt.value
										? "text-white"
										: "text-foreground"
								}
							>
								{opt.label}
							</HText>
						</Pressable>
					))}
				</View>

				<View className="rounded-xl border border-border overflow-hidden">
					{THEME_OPTIONS.map((opt, index) => (
						<Pressable
							key={opt.value}
							onPress={() => Uniwind.setTheme(opt.value)}
							className={`flex-row items-center justify-between px-4 py-4 active:opacity-70 ${
								index < THEME_OPTIONS.length - 1
									? "border-b border-border"
									: ""
							}`}
						>
							<View>
								<HText
									size="base"
									weight="medium"
									color="foreground"
								>
									{opt.label}
								</HText>
								<HText
									size="sm"
									color="muted"
									className="mt-0.5"
								>
									{opt.subtitle}
								</HText>
							</View>
							{activeTheme === opt.value ? (
								<View
									className="w-6 h-6 rounded-full border-2 items-center justify-center"
									style={{
										borderColor: String(primaryColor),
										backgroundColor: `${String(primaryColor)}20`,
									}}
								>
									<View
										className="w-2.5 h-2.5 rounded-full"
										style={{
											backgroundColor:
												String(primaryColor),
										}}
									/>
								</View>
							) : null}
						</Pressable>
					))}
				</View>
			</ScrollView>
		</>
	);
}
