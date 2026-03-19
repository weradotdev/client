import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";

import HText from "@/components/text";
import { useCSSVariable } from "uniwind";

export default function NotificationsScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");

	const [pushEnabled, setPushEnabled] = useState(true);
	const [emailTasks, setEmailTasks] = useState(true);
	const [emailDigest, setEmailDigest] = useState(false);
	const [marketing, setMarketing] = useState(false);

	const screenOptions = useMemo(
		() => ({
			headerShown: true,
			headerShadowVisible: false,
			title: "Notifications",
			headerTitleAlign: "center" as const,
			headerLeft: () => (
				<HeaderBackButton
					tintColor={String(primaryColor)}
					onPress={() => router.back()}
				/>
			),
			headerStyle: { backgroundColor: "#ffffff" },
			headerTintColor: String(primaryColor),
		}),
		[primaryColor, router],
	);

	return (
		<>
			<Stack.Screen options={screenOptions} />
			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				<HText
					size="xs"
					weight="semibold"
					color="muted"
					className="px-4 pt-4 pb-2 uppercase tracking-wide"
				>
					Push
				</HText>
				<View className="bg-background border-t border-border">
					<View className="flex-row items-center justify-between py-4 px-4 border-b border-border">
						<View className="flex-1">
							<HText size="base" weight="medium" color="foreground">
								Push notifications
							</HText>
							<HText size="sm" color="muted" className="mt-0.5">
								Task updates and mentions
							</HText>
						</View>
						<Switch
							value={pushEnabled}
							onValueChange={setPushEnabled}
							trackColor={{ false: "#e5e7eb", true: String(primaryColor) }}
							thumbColor="#fff"
						/>
					</View>
				</View>

				<HText
					size="xs"
					weight="semibold"
					color="muted"
					className="px-4 pt-6 pb-2 uppercase tracking-wide"
				>
					Email
				</HText>
				<View className="bg-background border-t border-border">
					<Pressable
						className="flex-row items-center justify-between py-4 px-4 border-b border-border active:opacity-70"
					>
						<View className="flex-1">
							<HText size="base" weight="medium" color="foreground">
								Task assignments & updates
							</HText>
							<HText size="sm" color="muted" className="mt-0.5">
								When you're assigned or mentioned
							</HText>
						</View>
						<Switch
							value={emailTasks}
							onValueChange={setEmailTasks}
							trackColor={{ false: "#e5e7eb", true: String(primaryColor) }}
							thumbColor="#fff"
						/>
					</Pressable>
					<Pressable
						className="flex-row items-center justify-between py-4 px-4 border-b border-border active:opacity-70"
					>
						<View className="flex-1">
							<HText size="base" weight="medium" color="foreground">
								Daily digest
							</HText>
							<HText size="sm" color="muted" className="mt-0.5">
								Summary of activity each morning
							</HText>
						</View>
						<Switch
							value={emailDigest}
							onValueChange={setEmailDigest}
							trackColor={{ false: "#e5e7eb", true: String(primaryColor) }}
							thumbColor="#fff"
						/>
					</Pressable>
					<Pressable
						className="flex-row items-center justify-between py-4 px-4 border-b border-border active:opacity-70"
					>
						<View className="flex-1">
							<HText size="base" weight="medium" color="foreground">
								Product updates & tips
							</HText>
							<HText size="sm" color="muted" className="mt-0.5">
								Occasional product news
							</HText>
						</View>
						<Switch
							value={marketing}
							onValueChange={setMarketing}
							trackColor={{ false: "#e5e7eb", true: String(primaryColor) }}
							thumbColor="#fff"
						/>
					</Pressable>
				</View>
			</ScrollView>
		</>
	);
}
