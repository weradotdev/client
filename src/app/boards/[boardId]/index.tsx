import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { FlatList, Pressable, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { filterTasks, useFiltersStore } from "@/stores/filters";
import { useCallback, useMemo, useState } from "react";

import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { HeaderBackButton } from "@react-navigation/elements";
import { HugeiconsIcon } from "@hugeicons/react-native";
import TaskCard from "@/components/task-card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

export default function BoardScreen() {
	const {boardId} = useLocalSearchParams<{
		boardId: string
	}>()
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");

	const [search, setSearch] = useState("");

	const user = useAuthStore(s => s.user);

	const {
		data: tasks,
		refetch: refetchTasks,
		isFetching: isFetchingTasks,
	} = useQuery({
		queryKey: ["tasks"],
		queryFn: () =>
			api<Task>("tasks").search("", ["forUser", { userId: user?.id }]),
	});

	const priority = useFiltersStore(s => s.priority);
	const dueAtFilter = useFiltersStore(s => s.dueAtFilter);
	const customDateStart = useFiltersStore(s => s.customDateStart);
	const customDateEnd = useFiltersStore(s => s.customDateEnd);
	const assignedMemberIds = useFiltersStore(s => s.assignedMemberIds);
	const projectQuery = useFiltersStore(s => s.projectQuery);

	const filters = useMemo(
		() => ({
			priority,
			dueAtFilter,
			customDateStart,
			customDateEnd,
			assignedMemberIds,
			projectQuery,
		}),
		[
			priority,
			dueAtFilter,
			customDateStart,
			customDateEnd,
			assignedMemberIds,
			projectQuery,
		],
	);

	const filteredByStore = useMemo(
		() => filterTasks(tasks?.data ?? [], filters),
		[tasks, filters],
	);

	const filteredTasks = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return filteredByStore;
		return filteredByStore.filter(
			task =>
				task.title.toLowerCase().includes(q) ||
				(task.project.name ?? "").toLowerCase().includes(q),
		);
	}, [filteredByStore, search]);

	const onTaskPress = useCallback(
		(taskId: number) => {
			router.push({ pathname: "/tasks/[taskId]", params: { taskId } });
		},
		[router],
	);

	const renderItem = useCallback(
		({ item }: { item: (typeof filteredTasks)[number] }) => (
			<TaskCard task={item} onPress={() => onTaskPress(Number(item.id))} />
		),
		[onTaskPress],
	);

	const ListHeader = useMemo(
		() => (
			<View className="px-4 pb-3 ios:hidden">
				<HTextInput
					leftIcon={
						<HugeiconsIcon
							icon={Search01Icon}
							size={20}
							color="#9ca3af"
						/>
					}
					placeholder="Search tasks or projects"
					placeholderTextColor="#9ca3af"
					value={search}
					onChangeText={setSearch}
					returnKeyType="search"
				/>

				<HText size="sm" color="muted" className="my-2">
					{filteredTasks.length} task
					{filteredTasks.length !== 1 ? "s" : ""}
				</HText>
			</View>
		),
		[search, filteredTasks.length],
	);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerBackTitle: "Back",
					headerShadowVisible: false,
					headerStyle: { backgroundColor: String(backgroundColor) },
					headerTitle: "Tasks",
					headerLeft: () => (
						<HeaderBackButton
							tintColor={String(primaryColor)}
							onPress={() => router.back()}
						/>
					),
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/filter")}
							hitSlop={12}
							className="pr-4 py-2 flex-row items-center gap-2"
						>
							<HugeiconsIcon
								icon={FilterIcon}
								size={22}
								color={String(primaryColor)}
							/>
							<HText size="sm" weight="medium" color="primary">
								Filters
							</HText>
						</Pressable>
					),
					headerTintColor: String(primaryColor),
				}}
			/>

			<Stack.SearchBar
				placeholder="Search tasks or projects"
				onChangeText={e => setSearch(e.nativeEvent.text)}
			/>

			<FlatList
				className="flex-1 px-3 bg-background"
				contentContainerClassName="pb-40 gap-4"
				data={filteredTasks}
				renderItem={renderItem}
				ListHeaderComponent={ListHeader}
				ListEmptyComponent={
					<View className="px-4 py-12 items-center">
						<HText size="sm" color="muted" className="text-center">
							{search.trim()
								? "No tasks match your search."
								: "No tasks match the current filters."}
						</HText>

						<Pressable
							onPress={() => router.push("/filter")}
							className="mt-3"
						>
							<HText size="sm" weight="medium" color="primary">
								Change filters
							</HText>
						</Pressable>
					</View>
				}
				showsVerticalScrollIndicator={false}
			/>
		</>
	);
}
