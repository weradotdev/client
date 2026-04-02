import { NativeTabs } from "expo-router/unstable-native-tabs";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

export default function AppTabs() {
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => api<DatabaseNotification>("notifications").index(),
		refetchInterval: 30000,
	});

	const user = useAuthStore(s => s.user);

	return (
		<NativeTabs
			indicatorColor={String(primaryColor)}
			sidebarAdaptable
			minimizeBehavior="onScrollDown"
			tintColor={String(primaryColor)}
			backgroundColor={String(backgroundColor)}
			labelStyle={{ fontSize: 12, fontFamily: "sans" }}
		>
			<NativeTabs.Trigger name="(home)">
				<NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="calendar" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="updates">
				<NativeTabs.Trigger.Label>Updates</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="message" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="notifications">
				<NativeTabs.Trigger.Label>
					Notifications
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="bell" />

				{notifications && notifications.total > 0 && (
					<NativeTabs.Trigger.Badge>
						{notifications.total.toString()}
					</NativeTabs.Trigger.Badge>
				)}
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="add" role="search">
				<NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{
						selected: "plus",
						default: "plus",
					}}
				/>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
