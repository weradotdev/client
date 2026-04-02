import {
	Add01Icon,
	AlertDiamondIcon,
	Calendar03Icon,
	CheckListIcon,
	MoreHorizontal,
	Tick01Icon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import HText from "@/components/text";
import { Stack, useLocalSearchParams, router, Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Image,
	ImageBackground,
	Pressable,
	ScrollView,
	Share,
	View,
} from "react-native";
import { useCSSVariable } from "uniwind";
import { type TasksState, useTasksStore } from "@/stores/tasks";
import Carousel from "@/components/carousel";
import { HeaderBackButton } from "@react-navigation/elements";

const DATE_RANGE = "Feb 23, 2026 - Feb 28, 2026";

export default function TaskDetailsScreen() {
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");
	const mutedForeground = useCSSVariable("--color-muted-foreground");

	const { taskId } = useLocalSearchParams<{ taskId: string }>();

	const task = useTasksStore(s => s.task);
	const setTaskChecklistCompleted = useTasksStore(
		(s: TasksState) => s.setTaskChecklistCompleted,
	);

	const checklist = task?.checklist ?? [];
	const completedAdjusted = task?.completed ?? checklist.map(() => false);
	const progress = task?.progress ?? 0;
	const previewComments = task?.comments?.slice(-2).reverse() ?? [];

	const toggleCheck = useCallback(
		(index: number) => {
			if (!task) return;
			const next = [...completedAdjusted];
			setTaskChecklistCompleted(Number(task.id), next);
		},
		[task, completedAdjusted, setTaskChecklistCompleted],
	);

	const [markedDone, setMarkedDone] = useState(
		() => task?.status === "Completed",
	);
	useEffect(() => {
		if (task?.status === "Completed") setMarkedDone(true);
	}, [task?.id, task?.status]);

	const handleShare = useCallback(async () => {
		if (!task) return;
		try {
			await Share.share({
				message: `${task.title}\nProgress: ${progress}%`,
				title: task.title,
			});
		} catch {
			// User dismissed or share not available
		}
	}, [task, progress]);

	const handleMarkDone = useCallback(() => {
		setMarkedDone(prev => !prev);
		// TODO: persist to store when you have setTaskStatus(taskId, status)
	}, []);

	const headerRight = useMemo(
		() => (
			<Pressable hitSlop={12}>
				<HugeiconsIcon
					icon={MoreHorizontal}
					size={28}
					color={String(primaryColor)}
				/>
			</Pressable>
		),
		[],
	);

	if (!task) {
		return (
			<>
				<Stack.Screen
					options={{ headerShown: true, title: "Task details" }}
				/>

				<View className="flex-1 items-center justify-center p-4">
					<HText color="muted">Task not found.</HText>
				</View>
			</>
		);
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Task details",
					headerTitleAlign: "center",
					headerShadowVisible: false,
					headerLeft: () => <HeaderBackButton tintColor={String(primaryColor)} onPress={() => router.back()} />,
					headerRight: () => headerRight,
					headerBackTitle: "Back",
					headerStyle: { backgroundColor: String(backgroundColor) },
					headerTintColor: String(primaryColor),
				}}
			/>

			<Stack.Toolbar placement="bottom">
				<Stack.Toolbar.Button
					icon="square.and.arrow.up"
					onPress={handleShare}
				>
					Share
				</Stack.Toolbar.Button>

				<Stack.Toolbar.Button
					icon={
						markedDone
							? "checkmark.circle.fill"
							: "checkmark.circle"
					}
					onPress={handleMarkDone}
				>
					{markedDone ? "Done" : "Mark done"}
				</Stack.Toolbar.Button>

				<Stack.Toolbar.Spacer />
				<Stack.Toolbar.Button
					icon="bubble.left.and.bubble.right"
					onPress={() => router.push(`/tasks/${taskId}/comments`)}
				>
					Comments
				</Stack.Toolbar.Button>
			</Stack.Toolbar>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName="px-4 pb-40"
				showsVerticalScrollIndicator={false}
			>
				<View className="h-60 ">
					<Carousel<{
						title: string;
						image_url: string;
						link: string;
					}>
						items={[
							{
								title: "Attachment 1",
								image_url:
									"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
								link: `/tasks/${taskId}/attachments/1`,
							},
						]}
						onItemPress={item => router.push(item.link as Href)}
					/>
				</View>

				<View className="py-5 gap-2">
					<HText
						size="xl"
						weight="bold"
						color="foreground"
						className="leading-tight"
					>
						{task.title}
					</HText>

					<View className="flex-row items-center gap-3">
						<View className="flex-1 h-2 bg-primary/15 rounded-full overflow-hidden">
							<View
								className="h-full rounded-full bg-primary"
								style={{ width: `${progress}%` }}
							/>
						</View>

						<HText size="sm" weight="semibold" color="foreground">
							{progress}%
						</HText>
					</View>

					<HText
						size="sm"
						weight="bold"
						color="muted"
						className="leading-tight"
					>
						{task.description}
					</HText>
				</View>

				<View className="border-t border-border py-4 gap-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-3">
							<HugeiconsIcon
								icon={CheckListIcon}
								size={20}
								color={String(mutedForeground)}
							/>
							<HText size="sm" color="muted">
								Task Status
							</HText>
						</View>
						<View className="rounded-full border border-primary px-3 py-1.5">
							<HText size="sm" weight="medium" color="primary">
								{task.board?.name}
							</HText>
						</View>
					</View>

					<View className="flex-row items-center justify-between gap-3">
						<View className="flex-row items-center gap-3">
							<HugeiconsIcon
								icon={Calendar03Icon}
								size={20}
								color={String(mutedForeground)}
							/>
							<HText size="sm" color="muted">
								Date
							</HText>
						</View>
						<HText size="sm" color="foreground">
							{DATE_RANGE}
						</HText>
					</View>

					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-3">
							<HugeiconsIcon
								icon={AlertDiamondIcon}
								size={20}
								color={String(mutedForeground)}
							/>
							<HText size="sm" color="muted">
								Priority
							</HText>
						</View>

						{task.priority != null && task.priority !== "" && (
							<View className="rounded-full border border-red-300 px-3 py-1.5">
								<HText
									size="sm"
									weight="medium"
									className="text-red-600"
								>
									{task.priority}
								</HText>
							</View>
						)}
					</View>
				</View>

				{checklist.length > 0 && (
					<View className="border-t border-border pt-5 pb-5">
						<HText
							size="base"
							weight="bold"
							color="foreground"
							className="mb-4"
						>
							Checklist
						</HText>
						<View className="gap-2">
							{checklist.map((item: string, index: number) => {
								const isDone = task.completed?.includes(item);
								return (
									<Pressable
										key={`${index}-${item}`}
										onPress={() => toggleCheck(index)}
										className="flex-row items-center gap-3 py-2"
									>
										<View
											className="w-6 h-6 rounded-md border-2 items-center justify-center shrink-0"
											style={{
												borderColor: String(
													isDone
														? primaryColor
														: mutedForeground,
												),
												backgroundColor: isDone
													? String(primaryColor)
													: "transparent",
											}}
										>
											{isDone && (
												<HugeiconsIcon
													icon={Tick01Icon}
													size={14}
													color="#ffffff"
												/>
											)}
										</View>

										<HText
											size="sm"
											color={
												isDone ? "muted" : "foreground"
											}
											className={
												isDone
													? "line-through flex-1"
													: "flex-1"
											}
										>
											{item}
										</HText>
									</Pressable>
								);
							})}
						</View>
					</View>
				)}

				<View className="border-t border-border pt-5 pb-5">
					<HText
						size="base"
						weight="bold"
						color="foreground"
						className="mb-4"
					>
						Assigned to
					</HText>

					<View className="flex-row items-center">
						{task.assigned_users
							?.slice(0, 5)
							.map((user, index: number) => (
								<View
									key={user.id}
									className="rounded-full border-2 border-background overflow-hidden"
									style={{
										marginLeft: index === 0 ? 0 : -10,
									}}
								>
									<Image
										source={{ uri: user.avatar }}
										style={{
											width: 40,
											height: 40,
											borderRadius: 20,
										}}
									/>
								</View>
							))}
						<Pressable
							className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background items-center justify-center"
							style={{ marginLeft: -10 }}
						>
							<HugeiconsIcon
								icon={Add01Icon}
								size={20}
								color={String(primaryColor)}
							/>
						</Pressable>
					</View>
				</View>

				<View className="border-t border-border pt-5">
					<View className="flex-row items-center justify-between mb-4">
						<HText size="base" weight="bold" color="foreground">
							Comments
						</HText>
						<Pressable
							className="flex-row items-center gap-2 rounded-full border border-primary px-3 py-2"
							onPress={() =>
								router.push(`/tasks/${taskId}/comments`)
							}
						>
							<HugeiconsIcon
								icon={Add01Icon}
								size={18}
								color={String(primaryColor)}
							/>
							<HText size="sm" weight="medium" color="primary">
								Add Comment
							</HText>
						</Pressable>
					</View>
					<View className="gap-4">
						{previewComments.map(comment => (
							<View key={comment.id} className="flex-row gap-3">
								<Image
									source={{ uri: comment.avatar }}
									style={{
										width: 36,
										height: 36,
										borderRadius: 18,
									}}
								/>
								<View className="flex-1 min-w-0">
									<View className="flex-row items-baseline justify-between gap-2 mb-0.5">
										<HText
											size="sm"
											weight="bold"
											color="foreground"
										>
											{comment.author}
										</HText>
										<HText size="xs" color="muted">
											{comment.timeAgo}
										</HText>
									</View>
									<HText
										size="sm"
										color="foreground-secondary"
										className="leading-snug"
										numberOfLines={4}
									>
										{comment.text}
									</HText>
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>
		</>
	);
}
