import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { format, parse } from "date-fns";
import { useCallback, useMemo, useState } from "react";

import Agenda from "@/components/agenda";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

function dateKey(d: Date): string {
	return format(d, "yyyy-MM-dd");
}

function groupTasksByDueDate(tasks: Task[]): Record<string, Task[]> {
	const byDate: Record<string, Task[]> = {};
	for (const task of tasks) {
		try {
			const d = parse(task.due_at || "", "MMM d, yyyy", new Date());
			const key = dateKey(d);
			if (!byDate[key]) byDate[key] = [];
			byDate[key].push(task);
		} catch {
			// skip tasks with unparseable due_at
		}
	}
	return byDate;
}

export default function AgendaScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");

	const { data: tasks } = useQuery({
		queryKey: ["tasks"],
		queryFn: () => api<Task>("tasks").search(),
		select: res => res.data,
	});
	const tasksByDate = useMemo(
		() => groupTasksByDueDate(tasks ?? []),
		[tasks],
	);

	const today = useMemo(() => new Date(), []);
	const [selectedDate, setSelectedDate] = useState(today);

	const addOneWeek = useCallback(() => {
		setSelectedDate(dayjs(selectedDate).add(1, "week").toDate());
	}, [selectedDate, setSelectedDate]);

	const subtractOneWeek = useCallback(() => {
		setSelectedDate(dayjs(selectedDate).subtract(1, "week").toDate());
	}, [selectedDate, setSelectedDate]);

	const onTaskPress = useCallback(
		(task: Task) => {
			router.push({
				pathname: "/tasks/[taskId]",
				params: { taskId: String(task.id) },
			});
		},
		[router],
	);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerBackTitle: "Back",
					headerShadowVisible: false,
					headerStyle: { backgroundColor: String(backgroundColor) },
					headerTitle: `${format(selectedDate, "d")} ${format(selectedDate, "MMM yyyy")}`,
					headerTitleAlign: "left",
					headerRight: () => (
						<View className="flex-row items-center gap-3">
							<Pressable hitSlop={12} onPress={subtractOneWeek}>
								<HugeiconsIcon
									icon={ArrowLeft01Icon}
									size={24}
									color={String(primaryColor)}
								/>
							</Pressable>

							<Pressable hitSlop={12} onPress={addOneWeek}>
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									size={24}
									color={String(primaryColor)}
								/>
							</Pressable>
						</View>
					),
					headerTintColor: String(primaryColor),
				}}
			/>

			<Agenda
				selectedDate={selectedDate}
				setSelectedDate={setSelectedDate}
				tasksByDate={tasksByDate}
				onTaskPress={onTaskPress}
			/>
		</>
	);
}
