import {
	Add01Icon,
	Calendar02Icon,
	Chatting01Icon,
	Notification01Icon,
	QuillWrite01Icon,
} from "@hugeicons/core-free-icons";

import CurvedTabBar from "./curved-tab-bar";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

export default function AppTabs() {
	const primaryColor = useCSSVariable("--color-primary");
	const mutedForeground = useCSSVariable("--color-muted-foreground");

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => api<DatabaseNotification>("notifications").index(),
		refetchInterval: 5000,
	});

	const user = useAuthStore(s => s.user);

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarBackground: () =>
					user && ['qa', 'owner', 'project_manager'].includes(user.type) ? (
						<CurvedTabBar>
							<></>
						</CurvedTabBar>
					) : null,
				tabBarStyle: {
					elevation: 0,
					shadowOpacity: 0,
					borderTopWidth: 0,
					borderRadius: 0,
					height: 80,
					position: "absolute",
					paddingTop: 16,
				},
				tabBarActiveTintColor: String(primaryColor),
				tabBarInactiveTintColor: String(mutedForeground),
			}}
		>
			<Tabs.Screen
				name="(home)"
				options={{
					tabBarLabel: "Schedule",
					tabBarIcon: ({ color, size }) => (
						<HugeiconsIcon
							icon={Calendar02Icon}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="(add)"
				options={{
					href: user && ['qa', 'owner', 'project_manager'].includes(user.type) ? undefined : null,
					tabBarIcon: () => (
						<View className="bg-primary rounded-full p-4 mb-8 shadow">
							<HugeiconsIcon
								icon={QuillWrite01Icon}
								size={36}
								color="#ffffff"
							/>
						</View>
					),
					tabBarLabel: "",
				}}
			/>

			<Tabs.Screen
				name="(updates)"
				options={{
					href: user && ['developer'].includes(user.type) ? undefined : null,
					tabBarLabel: "Updates",
					tabBarIcon: ({ color, size }) => (
						<HugeiconsIcon
							icon={Chatting01Icon}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="(notifications)"
				options={{
					tabBarLabel: "Notifications",
					tabBarBadge: notifications?.total ?? undefined,
					tabBarBadgeStyle: {
						backgroundColor: String(primaryColor),
					},
					tabBarIcon: ({ color, size }) => (
						<HugeiconsIcon
							icon={Notification01Icon}
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
