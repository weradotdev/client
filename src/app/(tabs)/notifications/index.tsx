import { Pressable, RefreshControl, SectionList, View } from "react-native";
import { useCallback, useEffect, useMemo } from "react";

import HText from "@/components/text";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { twMerge } from "tailwind-merge";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export type NotificationSection = {
	title: string;
	data: DatabaseNotification[];
};

function groupNotificationsByDate(
	items: DatabaseNotification[],
): NotificationSection[] {
	const sections: NotificationSection[] = [];
	let currentTitle: string | null = null;
	let currentData: DatabaseNotification[] = [];

	const now = dayjs();
	const startOfWeek = now.startOf("week");

	for (const item of items) {
		const d = dayjs(item.created_at);
		let title: string;
		if (d.isToday()) {
			title = "Today";
		} else if (d.isYesterday()) {
			title = "Yesterday";
		} else if (d.isAfter(startOfWeek) || d.isSame(startOfWeek)) {
			title = "This week";
		} else {
			title = d.format("ddd, MMM D");
		}

		if (title !== currentTitle) {
			if (currentData.length > 0 && currentTitle !== null) {
				sections.push({ title: currentTitle, data: currentData });
			}
			currentTitle = title;
			currentData = [item];
		} else {
			currentData.push(item);
		}
	}

	if (currentData.length > 0 && currentTitle !== null) {
		sections.push({ title: currentTitle, data: currentData });
	}

	return sections;
}

export default function NotificationsScreen() {
	const mutedForeground = useCSSVariable("--color-muted-foreground");
	const primaryColor = useCSSVariable("--color-primary");

	const {
		data: notifications,
		isLoading,
		refetch: refetchNotifications,
	} = useQuery({
		queryKey: ["notifications"],
		queryFn: () => api<DatabaseNotification>("notifications").index(),
		select: e => e?.data,
	});

	const sections = useMemo(
		() => groupNotificationsByDate(notifications || []),
		[notifications],
	);

	const onItemPress = useCallback(
		(item: DatabaseNotification) => {
			if (!item.read_at) {
				api<DatabaseNotification>("notifications")
					.update(item.id, {})
					.then(() => {
						refetchNotifications();
					});
			}
		},
		[refetchNotifications],
	);

	const markAllRead = useCallback(() => {
		api("notifications")
			.post("", {})
			.then(() => {
				refetchNotifications();
			})
			.catch(err => {
				console.error("Failed to mark notifications as read", err);
			});
	}, [refetchNotifications]);

	const renderSectionHeader = useCallback(
		({ section }: { section: NotificationSection }) => (
			<View className="bg-background px-4 pt-4 pb-2">
				<HText size="sm" weight="semibold" color="muted">
					{section.title}
				</HText>
			</View>
		),
		[],
	);

	const renderItem = useCallback(
		({ item }: { item: DatabaseNotification }) => {
			const timeStr = dayjs(item.created_at).format("h:mm A");
			return (
				<Pressable
					onPress={() => onItemPress(item)}
					className={twMerge(
						"px-4 py-3 border-b border-border",
						!item.read_at ? "bg-primary/5" : "",
					)}
				>
					<View className="flex-row items-center gap-3">
						{!item.read_at && (
							<View className="w-2.5 h-2.5 rounded-full flex-0 border border-primary bg-primary/80" />
						)}

						<View className="flex-1 min-w-0 py-0.5">
							<HText
								size="sm"
								weight="semibold"
								color="foreground"
								numberOfLines={1}
							>
								{item.data.title}
							</HText>
						</View>
						<View className="flex-row items-center gap-2">
							<HText size="xs" color="muted">
								{timeStr}
							</HText>
						</View>
					</View>

					<HText
						size="xs"
						color="muted"
						numberOfLines={1}
						className="mt-0.5"
					>
						{item.data.body}
					</HText>
				</Pressable>
			);
		},
		[primaryColor, mutedForeground],
	);

	const ListEmpty = useCallback(
		() => (
			<View className="flex-1 items-center justify-center py-16 px-6">
				<View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
					<SymbolView
						name="bell.slash"
						tintColor={String(mutedForeground)}
						size={28}
						weight="light"
					/>
				</View>
				<HText
					size="base"
					weight="semibold"
					color="foreground"
					className="text-center"
				>
					No notifications
				</HText>
				<HText size="sm" color="muted" className="text-center mt-1">
					You're all caught up. New updates will show here.
				</HText>
			</View>
		),
		[mutedForeground],
	);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerTitle: "",
					headerTintColor: "",
					headerLeft: () => (
						<HText
							size="lg"
							weight="bold"
							color="foreground"
							className="ios:ml-4"
						>
							Notifications
						</HText>
					),
					headerRight: () => (
						<Pressable
							onPress={markAllRead}
							className="py-1.5 px-2 active:opacity-70"
						>
							<HText size="sm" color="primary" weight="medium">
								Mark all read
							</HText>
						</Pressable>
					),
				}}
			/>

			<SectionList
				className="flex-1 bg-background"
				contentContainerClassName="pb-40 grow"
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={refetchNotifications}
					/>
				}
				sections={sections}
				keyExtractor={item => item.id}
				renderSectionHeader={renderSectionHeader}
				renderItem={renderItem}
				ListEmptyComponent={ListEmpty}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				stickySectionHeadersEnabled
			/>
		</>
	);
}
