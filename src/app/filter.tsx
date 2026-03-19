import {
    ArrowDown01Icon,
    Calendar03Icon,
    Search01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import { type DueDateFilter, type TaskFiltersState, useFiltersStore } from "@/stores/filters";
import { type Task, useTasksStore } from "@/stores/tasks";
import { useCSSVariable } from "uniwind";

const PRIORITIES = [
	{ label: "Urgent", value: "Urgent", pillClass: "bg-red-500 border-red-500" },
	{ label: "High", value: "High", pillClass: "bg-orange-500 border-orange-500" },
	{ label: "Normal", value: "Normal", pillClass: "bg-blue-500 border-blue-500" },
	{ label: "Low", value: "Low", pillClass: "bg-gray-400 border-gray-400" },
] as const;

const DUE_OPTIONS: { label: string; value: DueDateFilter }[] = [
	{ label: "Today", value: "today" },
	{ label: "This week", value: "this_week" },
	{ label: "Overdue", value: "overdue" },
	{ label: "Custom range", value: "custom" },
];

export default function FilterScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");

	const tasks = useTasksStore((s: { tasks: Task[] }) => s.tasks);
	const priority = useFiltersStore((s: TaskFiltersState) => s.priority);
	const dueAtFilter = useFiltersStore((s: TaskFiltersState) => s.dueAtFilter);
	const customDateStart = useFiltersStore((s: TaskFiltersState) => s.customDateStart);
	const customDateEnd = useFiltersStore((s: TaskFiltersState) => s.customDateEnd);
	const assignedMemberIds = useFiltersStore((s: TaskFiltersState) => s.assignedMemberIds);
	const projectQuery = useFiltersStore((s: TaskFiltersState) => s.projectQuery);

	const setPriority = useFiltersStore((s: TaskFiltersState) => s.setPriority);
	const setDueDateFilter = useFiltersStore((s: TaskFiltersState) => s.setDueDateFilter);
	const setCustomDateRange = useFiltersStore((s: TaskFiltersState) => s.setCustomDateRange);
	const toggleAssignedMember = useFiltersStore((s: TaskFiltersState) => s.toggleAssignedMember);
	const setProjectQuery = useFiltersStore((s: TaskFiltersState) => s.setProjectQuery);
	const clearAll = useFiltersStore((s: TaskFiltersState) => s.clearAll);

	const uniqueMembers = useMemo(() => {
		const seen = new Set<string>();
		const list: { id: string; avatar: string }[] = [];
		for (const task of tasks) {
			for (const u of task.users) {
				if (!seen.has(u.id)) {
					seen.add(u.id);
					list.push({ id: u.id, avatar: u.avatar });
				}
			}
		}
		return list;
	}, [tasks]);

	const projectSuggestions = useMemo(() => {
		const set = new Set<string>();
		tasks.forEach((t: Task) => {
			if (t.project) set.add(t.project);
		});
		return Array.from(set).sort();
	}, [tasks]);

	const hasActiveFilters =
		priority != null ||
		dueAtFilter != null ||
		(dueAtFilter === "custom" && customDateStart != null && customDateEnd != null) ||
		assignedMemberIds.length > 0 ||
		projectQuery.trim() !== "";

	const handleClearAll = () => {
		clearAll();
		router.back();
	};

	const handleApply = () => {
		router.back();
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: "Filter",
					headerRight: () =>
						hasActiveFilters ? (
							<Pressable onPress={handleClearAll} hitSlop={12}>
								<HText size="sm" weight="medium" color="primary">
									Clear all
								</HText>
							</Pressable>
						) : null,
					presentation: "formSheet",
					sheetGrabberVisible: true,
					contentStyle: { backgroundColor: "#fff" },
					sheetAllowedDetents: [0.75, 1.0],
					sheetCornerRadius: 24,
					headerTintColor: String(primaryColor),
				}}
			/>
			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName="px-4 pb-32"
				showsVerticalScrollIndicator={false}
			>
				{/* Priority */}
				<View className="mb-6">
					<HText size="sm" weight="bold" color="foreground" className="mb-3">
						Priority
					</HText>
					<View className="flex-row flex-wrap gap-2">
						{PRIORITIES.map(({ label, value, pillClass }) => {
							const selected = priority === value;
							return (
								<Pressable
									key={value}
									onPress={() => setPriority(selected ? null : value)}
									className={`px-4 py-2.5 rounded-full border ${
										selected
											? `${pillClass} border-transparent`
											: "bg-background border-border"
									}`}
								>
									<HText
										size="sm"
										weight="medium"
										className={selected ? "text-white" : "text-foreground"}
									>
										{label}
									</HText>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Due date */}
				<View className="mb-6">
					<HText size="sm" weight="bold" color="foreground" className="mb-3">
						Due date
					</HText>
					<View className="flex-row flex-wrap gap-2">
						{DUE_OPTIONS.map(({ label, value }) => {
							const isCustom = value === "custom";
							const selected = dueAtFilter === value;
							return (
								<Pressable
									key={value}
									onPress={() => {
										if (value === "custom") {
											setDueDateFilter("custom");
											if (!customDateStart || !customDateEnd) {
												const today = new Date();
												const weekEnd = new Date(today);
												weekEnd.setDate(weekEnd.getDate() + 7);
												setCustomDateRange(
													today.toISOString().slice(0, 10),
													weekEnd.toISOString().slice(0, 10),
												);
											}
										} else {
											setCustomDateRange(null, null);
											setDueDateFilter(selected ? null : value);
										}
									}}
									className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border ${
										selected ? "bg-primary border-primary" : "bg-background border-border"
									}`}
								>
									{isCustom && (
										<HugeiconsIcon
											icon={Calendar03Icon}
											size={16}
											color={selected ? "#fff" : "#6b7280"}
										/>
									)}
									<HText
										size="sm"
										weight="medium"
										className={selected ? "text-white" : "text-foreground"}
									>
										{label}
									</HText>
								</Pressable>
							);
						})}
					</View>
					{dueAtFilter === "custom" && (
						<View className="flex-row gap-3 mt-3">
							<View className="flex-1">
								<HText size="xs" weight="medium" className="text-muted-foreground mb-1">
									Start
								</HText>
								<TextInput
									className="bg-gray-100 border border-border rounded-xl px-3 py-2.5 text-sm"
									placeholder="YYYY-MM-DD"
									value={customDateStart ?? ""}
									onChangeText={v => setCustomDateRange(v || null, customDateEnd)}
									placeholderTextColor="#9ca3af"
								/>
							</View>
							<View className="flex-1">
								<HText size="xs" weight="medium" className="text-muted-foreground mb-1">
									End
								</HText>
								<TextInput
									className="bg-gray-100 border border-border rounded-xl px-3 py-2.5 text-sm"
									placeholder="YYYY-MM-DD"
									value={customDateEnd ?? ""}
									onChangeText={v => setCustomDateRange(customDateStart, v || null)}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>
					)}
				</View>

				{/* Assigned Members */}
				<View className="mb-6">
					<HText size="sm" weight="bold" color="foreground" className="mb-3">
						Assigned Members
					</HText>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerClassName="gap-3 flex-row items-center"
					>
						{uniqueMembers.map(m => {
							const selected = assignedMemberIds.includes(m.id);
							return (
								<Pressable
									key={m.id}
									onPress={() => toggleAssignedMember(m.id)}
									className="relative"
								>
									<Image
										source={{ uri: m.avatar }}
										className="w-12 h-12 rounded-full bg-gray-200"
									/>
									{selected && (
										<View
											className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary border-2 border-white items-center justify-center"
										>
											<HugeiconsIcon
												icon={Tick02Icon}
												size={12}
												color="#fff"
											/>
										</View>
									)}
								</Pressable>
							);
						})}
						<Pressable className="w-12 h-12 rounded-full border-2 border-dashed border-border items-center justify-center">
							<HText size="xl" className="text-muted-foreground">+</HText>
						</Pressable>
					</ScrollView>
				</View>

				{/* Projects */}
				<View className="mb-6">
					<HText size="sm" weight="bold" color="foreground" className="mb-3">
						Projects
					</HText>
					<View className="flex-row items-center relative">
						<View className="absolute left-4 z-10">
							<HugeiconsIcon
								icon={Search01Icon}
								size={20}
								color="#9ca3af"
							/>
						</View>
						<TextInput
							className="flex-1 pl-11 pr-11 py-3.5 bg-gray-100 border border-border rounded-2xl text-base"
							placeholder="Landing page"
							value={projectQuery}
							onChangeText={setProjectQuery}
							placeholderTextColor="#9ca3af"
						/>
						<View className="absolute right-4 z-10">
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								size={20}
								color="#6b7280"
							/>
						</View>
					</View>
					{projectSuggestions.length > 0 && (
						<View className="flex-row flex-wrap gap-2 mt-2">
							{projectSuggestions.map(proj => (
								<Pressable
									key={proj}
									onPress={() =>
										setProjectQuery(projectQuery === proj ? "" : proj)
									}
									className={`px-3 py-1.5 rounded-full border ${
										projectQuery === proj
											? "bg-primary border-primary"
											: "bg-background border-border"
									}`}
								>
									<HText
										size="xs"
										weight="medium"
										className={projectQuery === proj ? "text-white" : "text-foreground"}
									>
										{proj}
									</HText>
								</Pressable>
							))}
						</View>
					)}
				</View>
			</ScrollView>

			{/* Apply button - fixed at bottom */}
			<View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-background border-t border-border">
				<HPressable
					label="Apply Filters"
					variant="primary"
					size="lg"
					onPress={handleApply}
				/>
			</View>
		</>
	);
}
