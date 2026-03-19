import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { BottomTabInset, Spacing } from "@/constants/theme";
import {
	Dimensions,
	Pressable,
	RefreshControl,
	SectionList,
	View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
	addDays,
	addWeeks,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { useCallback, useMemo, useState } from "react";

import HText from "@/components/text";
import { HugeiconsIcon } from "@hugeicons/react-native";
import TaskCard from "@/components/task-card";
import { scheduleOnRN } from "react-native-worklets";
import { twMerge } from "tailwind-merge";
import { useCSSVariable } from "uniwind";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_CELL_SIZE = 36;

function dateKey(d: Date): string {
	return format(d, "yyyy-MM-dd");
}

type DateSection = {
	date: Date;
	dateKey: string;
	label: string;
	tasks: Task[];
};

function buildSections(
	selectedDate: Date,
	tasksByDate: Record<string, Task[]>,
	numDays: number,
): DateSection[] {
	const sections: DateSection[] = [];
	for (let i = 0; i < numDays; i++) {
		const d = addDays(selectedDate, i);
		const key = dateKey(d);
		const tasks = tasksByDate[key] ?? [];
		sections.push({
			date: d,
			dateKey: key,
			label: isToday(d) ? "Today" : format(d, "d MMMM"),
			tasks,
		});
	}
	return sections;
}

export default function Agenda({
	selectedDate,
	setSelectedDate,
	tasksByDate,
	onTaskPress,
}: {
	selectedDate: Date;
	setSelectedDate: (date: Date) => void;
	tasksByDate: Record<string, Task[]>;
	onTaskPress: (task: Task) => void;
}) {
	const primaryColor = useCSSVariable("--color-primary");

	const today = useMemo(() => new Date(), []);

	const [calendarExpanded, setCalendarExpanded] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const screenWidth = Dimensions.get("window").width;

	const monthGrid = useMemo(() => {
		const start = startOfMonth(selectedDate);
		const end = endOfMonth(selectedDate);
		const weekStart = startOfWeek(start, { weekStartsOn: 1 });
		const weekEnd = endOfWeek(end, { weekStartsOn: 1 });
		return eachDayOfInterval({ start: weekStart, end: weekEnd });
	}, [selectedDate]);

	const weekStripDates = useMemo(() => {
		const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
		return eachDayOfInterval({
			start: weekStart,
			end: addDays(weekStart, 6),
		});
	}, [selectedDate]);

	const weekStart = useMemo(
		() => startOfWeek(selectedDate, { weekStartsOn: 1 }),
		[selectedDate],
	);

	const dateSections = useMemo(() => {
		const start = calendarExpanded ? selectedDate : weekStart;
		const numDays = calendarExpanded ? 3 : 7;
		return buildSections(start, tasksByDate, numDays);
	}, [calendarExpanded, selectedDate, weekStart, tasksByDate]);

	const goToPrevWeek = useCallback(() => {
		setSelectedDate(addWeeks(selectedDate, -1));
	}, [selectedDate, setSelectedDate]);

	const goToNextWeek = useCallback(() => {
		setSelectedDate(addWeeks(selectedDate, 1));
	}, [selectedDate, setSelectedDate]);

	const weekStripPanGesture = useMemo(
		() =>
			Gesture.Pan()
				.activeOffsetX([-20, 20])
				.onEnd(e => {
					"worklet";
					const { translationX, velocityX } = e;
					if (translationX < -40 || velocityX < -0.3) {
						scheduleOnRN(goToNextWeek);
					} else if (translationX > 40 || velocityX > 0.3) {
						scheduleOnRN(goToPrevWeek);
					}
				}),
		[goToPrevWeek, goToNextWeek],
	);

	const sectionListData = useMemo(
		() =>
			dateSections.map(s => ({
				title: s.label,
				data: s.tasks,
				dateKey: s.dateKey,
				label: s.label,
				date: s.date,
			})),
		[dateSections],
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 400);
	}, []);

	const cellWidth = (screenWidth - Spacing.two * 2) / 7;

	const renderMonthDay = useCallback(
		(day: Date) => {
			const key = dateKey(day);
			const selected = isSameDay(day, selectedDate);
			const currentMonth = isSameMonth(day, selectedDate);
			const isTodayDate = isToday(day);
			const hasEvents = (tasksByDate[key]?.length ?? 0) > 0;
			return (
				<Pressable
					key={key}
					onPress={() => setSelectedDate(day)}
					style={{
						width: cellWidth,
						height: DAY_CELL_SIZE,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<View
						className={twMerge(
							"w-9 h-9 items-center justify-center rounded-full",
							selected ? "bg-primary" : isTodayDate ? "bg-primary/20" : "",
						)}
					>
						<HText
							size="sm"
							className={
								selected
									? "text-white font-semibold"
									: !currentMonth
										? "text-muted-foreground/60"
										: isTodayDate
											? "text-primary font-semibold"
											: "text-foreground"
							}
						>
							{format(day, "d")}
						</HText>
					</View>
					{hasEvents && (
						<View className="w-1 h-1 rounded-full bg-muted-foreground mt-0.5" />
					)}
				</Pressable>
			);
		},
		[selectedDate, cellWidth, tasksByDate],
	);

	const renderTaskCard = useCallback(
		(item: Task) => (
			<View className="px-4 pb-3 bg-background">
				<TaskCard task={item} onPress={() => onTaskPress(item)} />
			</View>
		),
		[onTaskPress],
	);

	const listHeaderComponent = useMemo(
		() => (
			<View className="border-b border-border bg-background">
				{calendarExpanded ? (
					<>
						<View className="px-2 pt-2 pb-1 flex-row justify-around">
							{WEEKDAY_LABELS.map(label => (
								<View
									key={label}
									style={{
										width: cellWidth,
										alignItems: "center",
									}}
								>
									<HText size="xs" color="muted">
										{label}
									</HText>
								</View>
							))}
						</View>

						<View className="flex-row flex-wrap px-2 pb-3">
							{monthGrid.map(renderMonthDay)}
						</View>
					</>
				) : (
					<>
						<View className="px-2 pt-2 pb-1 flex-row justify-around">
							{WEEKDAY_LABELS.map(label => (
								<View
									key={label}
									style={{
										width: cellWidth,
										alignItems: "center",
									}}
								>
									<HText size="xs" color="muted">
										{label}
									</HText>
								</View>
							))}
						</View>

						<GestureDetector gesture={weekStripPanGesture}>
							<View className="flex-row px-2 pb-2">
								{weekStripDates.map(d => {
									const selected = isSameDay(d, selectedDate);
									const isTodayDate = isToday(d);
									const hasEvents =
										(tasksByDate[dateKey(d)]?.length ?? 0) >
										0;
									return (
										<Pressable
											key={dateKey(d)}
											onPress={() => setSelectedDate(d)}
											style={{
												width: cellWidth,
												alignItems: "center",
											}}
											className="py-2"
										>
											<View
												className={twMerge(
													"w-9 h-9 items-center justify-center rounded-full",
													selected ? "bg-primary" : isTodayDate ? "bg-primary/10" : "",
												)}
											>
												<HText
													size="base"
													className={
														selected
															? "text-white font-semibold"
															: isTodayDate
																? "text-primary font-semibold"
																: "text-foreground"
													}
												>
													{format(d, "d")}
												</HText>
											</View>
											{hasEvents && (
												<View
													className="w-1.5 h-1.5 rounded-full mt-1"
													style={{
														backgroundColor:
															selected
																? "#fff"
																: String(
																		primaryColor,
																	),
													}}
												/>
											)}
										</Pressable>
									);
								})}
							</View>
						</GestureDetector>
					</>
				)}

				<Pressable
					onPress={() => setCalendarExpanded(e => !e)}
					className="items-center pt-2 pb-3"
				>
					<View className="h-px w-full max-w-12 bg-border mb-2" />
					<HText size="lg" color="muted">
						<HugeiconsIcon
							icon={
								calendarExpanded
									? ArrowUp01Icon
									: ArrowDown01Icon
							}
							size={24}
							color="muted"
						/>
					</HText>
				</Pressable>
			</View>
		),
		[
			calendarExpanded,
			cellWidth,
			monthGrid,
			weekStripDates,
			selectedDate,
			tasksByDate,
			renderMonthDay,
			primaryColor,
			weekStripPanGesture,
		],
	);

	const renderSectionHeader = useCallback(
		({ section }: { section: (typeof sectionListData)[0] }) => (
			<View className="flex-row justify-between items-center px-4 py-3 bg-background">
				<HText size="sm" className="text-foreground font-semibold">
					{section.label}
				</HText>
				<HText size="sm" color="muted">
					{section.data.length} task
					{section.data.length !== 1 ? "s" : ""}
				</HText>
			</View>
		),
		[],
	);

	const renderSectionItem = useCallback(
		({ item }: { item: Task }) => renderTaskCard(item),
		[renderTaskCard],
	);

	return (
		<SectionList
			sections={sectionListData}
			renderItem={renderSectionItem}
			renderSectionHeader={renderSectionHeader}
			ListHeaderComponent={listHeaderComponent}
			stickySectionHeadersEnabled
			className="flex-1 bg-background"
			contentContainerClassName="pb-40"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor={String(primaryColor)}
				/>
			}
		/>
	);
}
