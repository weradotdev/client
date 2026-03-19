import {
	ArrowDown01Icon,
	Calendar03Icon,
	Chat01Icon,
	FilterIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { filterTasks, useFiltersStore } from "@/stores/filters";
import { useCallback, useEffect, useMemo, useState } from "react";

import HText from "@/components/text";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ParallaxScrollView from "@/components/parallax-scrollview";
import ProjectSwitcherModal from "@/components/project-switcher-modal";
import { StatsCard } from "@/components/stats-card";
import TaskCard from "@/components/task-card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";
import { useTasksStore } from "@/stores/tasks";

const FILTER_OPTIONS = ["All", "Upcoming", "In Progress", "Review"] as const;

export default function HomeScreen() {
	const router = useRouter();

	const user = useAuthStore(s => s.user);
	const currentProject = useAuthStore(s => s.currentProject);
	const setCurrentProject = useAuthStore(s => s.setCurrentProject);

	const setTask = useTasksStore(s => s.setTask);

	const [activeFilter, setActiveFilter] = useState<number>();
	const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

	// Fetch stats with 30-minute refresh
	const { data: stats, isFetching: isFetchingStats } = useQuery({
		queryKey: ["stats", user?.id, user?.type],
		queryFn: async () =>
			await api().get<StatsData>(`stats/${user?.type ?? "developer"}`),
		// Refetch every 30 minutes (1800000 ms)
		refetchInterval: 30 * 60 * 1000,
		// Keep data fresh but don't refetch while window is focused
		staleTime: 30 * 60 * 1000,
		// Retry once on failure
		retry: 1,
	});

	const {
		data: boards,
		refetch: refetchBoards,
		isFetching: isFetchingBoards,
	} = useQuery({
		queryKey: ["boards", currentProject?.id],
		queryFn: () =>
			api<Board>("boards").search("", [
				"forProject",
				{ projectId: currentProject?.id },
			]),
	});

	const {
		data: tasks,
		refetch: refetchTasks,
		isFetching: isFetchingTasks,
	} = useQuery({
		queryKey: ["tasks", user?.id],
		queryFn: () =>
			api<Task>("tasks").search(undefined, [
				"forUser",
				{ userId: user?.id },
			]),
	});

	const {
		data: projects,
		refetch: refetchProjects,
		isFetching: isFetchingProjects,
	} = useQuery({
		queryKey: ["projects", user?.id],
		queryFn: () =>
			api<Project>("projects").search(undefined, [
				"forUser",
				{ userId: user?.id },
			]),
	});

	const effectiveCurrent = currentProject ?? projects?.data[0] ?? null;

	const primaryColor =
		currentProject?.color || useCSSVariable("--color-primary");

	const onRefresh = useCallback(async () => {
		refetchProjects();
		refetchTasks();
	}, []);

	const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Imran";

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
		() => (tasks ? filterTasks(tasks.data ?? [], filters) : []),
		[tasks, filters],
	);

	const filteredTasks = useMemo(() => {
		if (activeFilter === undefined) return filteredByStore;
		return filteredByStore.filter(task => task.board_id === activeFilter);
	}, [filteredByStore, activeFilter]);

	const onTaskPress = useCallback(
		(task: Task) => {
			setTask(task);
			router.push({
				pathname: "/tasks/[taskId]",
				params: { taskId: String(task.id) },
			});
		},
		[router],
	);

	useEffect(() => {
		if (!currentProject && projects) {
			setCurrentProject(projects.data[0]);
		}
	}, [projects]);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerTransparent: true,
					headerTitle: "",
					headerLeft: () => (
						<Link href="/profile" asChild>
							<Pressable className="flex-row items-center">
								<Image
									source={{
										uri:
											currentProject?.icon_url ??
											user?.avatar ??
											"",
									}}
									className="w-12 h-12 ios:w-9 ios:h-9 rounded-full"
									resizeMode="cover"
								/>

								<View className="hidden">
									<HText size="sm" className="text-white/80">
										Welcome back!
									</HText>

									<HText
										size="lg"
										weight="bold"
										color="white"
									>
										{displayName}
									</HText>
								</View>
							</Pressable>
						</Link>
					),
					headerRight: () => (
						<View className="flex-row items-center gap-3">
							<Link
								href={{
									pathname: "/tasks",
									params: {
										search: "all",
									},
								}}
								asChild
							>
								<Pressable
									hitSlop={12}
									className="bg-primary rounded-full w-9 h-9 items-center justify-center"
								>
									<HugeiconsIcon
										icon={Search01Icon}
										size={20}
										color="#ffffff"
									/>
								</Pressable>
							</Link>
						</View>
					),
					headerTintColor: "#ffffff",
				}}
			/>

			<ParallaxScrollView
				refreshing={
					isFetchingProjects || isFetchingTasks || isFetchingStats
				}
				onRefresh={onRefresh}
				headerHeight={360}
				contentClassName="flex-1 bg-background rounded-t-3xl pt-6 px-4"
				headerClassName="pt-32 px-4 pb-6 bg-primary/50 flex-row flex-wrap gap-3"
				headerComponent={
					stats ? (
						<>
							<StatsCard
								value={stats.total_tasks}
								label="All Tasks"
							/>
							<StatsCard
								value={stats.completed_tasks}
								label="Completed"
							/>
							<StatsCard
								value={stats.in_progress_tasks}
								label="In Progress"
							/>
							<StatsCard
								value={stats.overdue_tasks}
								label="Overdue"
							/>
							<StatsCard
								value={stats.active_projects}
								label="Projects"
							/>
							<StatsCard
								value={`${stats.completion_rate}%`}
								label="Completion Rate"
								variant="accent"
							/>
						</>
					) : (
						<View className="flex-1 items-center justify-center py-4">
							<HText
								size="sm"
								color="white"
								className="opacity-70"
							>
								Loading stats...
							</HText>
						</View>
					)
				}
			>
				<View className="flex-row items-center justify-between mb-1">
					<HText size="lg" weight="bold" color="foreground">
						{currentProject?.name ?? "All Projects"}
					</HText>

					<Pressable
						onPress={() => setShowProjectSwitcher(true)}
						className="flex-row items-center gap-1.5 max-w-35"
					>
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							size={24}
							color={String(primaryColor)}
						/>
					</Pressable>
				</View>

				{/* Filter chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mb-2 pr-8"
				>
					{boards?.data?.map(opt => (
						<Pressable
							key={opt.id}
							onPress={() => setActiveFilter(Number(opt.id))}
							className={`mr-2 px-4 py-2 rounded-full ${
								activeFilter === opt.id
									? "bg-primary"
									: "bg-background border border-border"
							}`}
						>
							<HText
								size="sm"
								weight="medium"
								className={
									activeFilter === opt.id
										? "text-white"
										: "text-foreground"
								}
							>
								{opt.name}
							</HText>
						</Pressable>
					))}
				</ScrollView>

				{/* Task count + Calendar + Filters */}
				<View className="flex-row items-center justify-between mb-4">
					<HText size="base" weight="bold" color="foreground">
						{filteredTasks.length} Tasks Available
					</HText>

					<View className="flex-row items-center gap-2">
						<Link
							href={{ pathname: "/(tabs)/(updates)" }}
							className="ios:hidden"
							asChild
						>
							<HugeiconsIcon
								icon={Chat01Icon}
								size={24}
								color={String(primaryColor)}
							/>
						</Link>

						<Link href={{ pathname: "/agenda" }} asChild>
							<HugeiconsIcon
								icon={Calendar03Icon}
								size={24}
								color={String(primaryColor)}
							/>
						</Link>

						<Pressable
							className="flex-row items-center gap-2 px-3 py-2 rounded-full border border-primary"
							onPress={() => router.push("/filter")}
						>
							<HugeiconsIcon
								icon={FilterIcon}
								size={18}
								color={String(primaryColor)}
							/>
							<HText size="sm" weight="medium" color="primary">
								Filters
							</HText>
						</Pressable>
					</View>
				</View>

				{/* Task list */}
				{filteredTasks.map(task => (
					<TaskCard
						key={task.id}
						task={task}
						onPress={() => onTaskPress(task)}
					/>
				))}
			</ParallaxScrollView>

			{projects && (
				<ProjectSwitcherModal
					visible={showProjectSwitcher}
					onClose={() => setShowProjectSwitcher(false)}
					projects={projects.data}
					currentProjectId={String(currentProject?.id)}
					onSelectProject={setCurrentProject}
				/>
			)}
		</>
	);
}
