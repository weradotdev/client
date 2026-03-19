import { ArrowRight, Edit01Icon, UserIcon } from "@hugeicons/core-free-icons";
import {
	Image,
	ImageBackground,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { Stack, useRouter } from "expo-router";

import HText from "@/components/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { SymbolView } from "expo-symbols";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useMemo } from "react";

const AVATAR_URI =
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";

type SettingsRowProps = {
	title: string;
	subtitle?: string;
	href: string;
};

function SettingsRow({ title, subtitle, href }: SettingsRowProps) {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");

	return (
		<Pressable
			onPress={() => router.push(href as import("expo-router").Href)}
			className="flex-row items-center justify-between py-4 px-4 border-b border-border active:opacity-70"
		>
			<View className="flex-1 min-w-0">
				<HText size="base" weight="medium" color="foreground">
					{title}
				</HText>

				{subtitle ? (
					<HText
						size="sm"
						color="muted"
						numberOfLines={1}
						className="mt-0.5"
					>
						{subtitle}
					</HText>
				) : null}
			</View>

			<HugeiconsIcon
				icon={ArrowRight}
				color={String(primaryColor)}
				size={18}
			/>
		</Pressable>
	);
}

export default function ProfileScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");
	const user = useAuthStore(s => s.user);
	const currentProject = useAuthStore(s => s.currentProject);
	const logout = useAuthStore(s => s.logout);

	const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";
	const email = user?.email ?? "—";

	const screenOptions = useMemo(
		() => ({
			headerShown: true,
			headerShadowVisible: false,
			headerTitle: "Profile",
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

	const handleLogout = () => {
		logout();
		router.replace("/(guest)/login" as import("expo-router").Href);
	};

	return (
		<>
			<Stack.Screen options={screenOptions} />
			
			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* User card */}
				<View className="px-4 pb-6 flex-row items-center gap-4">
					<ImageBackground
						source={{ uri: user?.avatar ?? AVATAR_URI }}
						className="w-20 h-20 relative"
						imageClassName="w-20 h-20 rounded-full bg-primary/20"
						resizeMode="cover"
					>
						<Pressable
							className="absolute right-0 top-0"
							onPress={() => router.push("/profile/account")}
						>
							<HugeiconsIcon
								icon={Edit01Icon}
								color={String(primaryColor)}
								size={20}
							/>
						</Pressable>
					</ImageBackground>

					<View className="flex-1 min-w-0">
						<HText size="xl" weight="bold" color="foreground">
							{displayName}
						</HText>

						<HText
							size="sm"
							color="muted"
							numberOfLines={1}
							className="mt-1"
						>
							{email}
						</HText>
					</View>
				</View>

				<View className="bg-background mt-2 px-4">
					<HText
						size="xs"
						weight="semibold"
						color="muted"
						className="py-2 uppercase tracking-wide"
					>
						Projects
					</HText>

					<HText size="lg">
						{currentProject?.name ?? "No project selected"}
					</HText>
				</View>

				{/* Settings sections */}
				<View className="bg-background mt-2">
					<HText
						size="xs"
						weight="semibold"
						color="muted"
						className="px-4 py-2 uppercase tracking-wide"
					>
						Account
					</HText>

					<SettingsRow
						title="Account"
						subtitle="Email, name, and profile"
						href="/profile/account"
					/>

					<SettingsRow
						title="Password"
						subtitle="Change your password"
						href="/profile/password"
					/>
				</View>

				<View className="bg-background mt-4">
					<HText
						size="xs"
						weight="semibold"
						color="muted"
						className="px-4 py-2 uppercase tracking-wide"
					>
						Preferences
					</HText>
					<SettingsRow
						title="Notifications"
						subtitle="Push and email preferences"
						href="/profile/notifications"
					/>
					<SettingsRow
						title="Appearance"
						subtitle="Theme and display"
						href="/profile/appearance"
					/>
				</View>

				<View className="px-4 pt-8">
					<Pressable
						onPress={handleLogout}
						className="py-4 rounded-xl border border-red-500/50 items-center active:opacity-70"
					>
						<HText size="base" weight="semibold" color="danger">
							Log out
						</HText>
					</Pressable>
				</View>

				<View className="mt-5 flex-row justify-center">
					<HText
						size="xs"
						weight="semibold"
						color="muted"
						className="px-4 py-2 tracking-wide"
					>
						v2.0.0-beta.1
					</HText>
				</View>
			</ScrollView>
		</>
	);
}
