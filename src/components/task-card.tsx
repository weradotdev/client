import {
	Calendar03Icon,
	Comment01Icon,
	MoreVertical,
} from "@hugeicons/core-free-icons";
import { Image, Pressable, View } from "react-native";

import HText from "@/components/text";
import { HugeiconsIcon } from "@hugeicons/react-native";
import dayjs from "dayjs";
import { useCSSVariable } from "uniwind";

const OVERLAY_OFFSET = 10;
const MAX_VISIBLE_AVATARS = 3;
const AVATAR_SIZE = 24;

export type TaskCardUser = {
	id: string;
	avatar: string;
};

export type TaskCardProps = {
	task: Task;
	onPress: () => void;
	onOptionsPress?: () => void;
};

export default function TaskCard({
	task,
	onPress,
	onOptionsPress,
}: TaskCardProps) {
	const mutedForeground = useCSSVariable("--color-muted-foreground");
	const primaryColor = useCSSVariable("--color-primary");

	const visibleUsers = task.assigned_users?.slice(0, MAX_VISIBLE_AVATARS);
	const overflowCount = !!task.assigned_users
		? task.assigned_users.length - MAX_VISIBLE_AVATARS
		: 0;

	return (
		<Pressable
			onPress={onPress}
			className="bg-primary/6 rounded-2xl p-4 border border-border shadow-sm"
		>
			<View className="flex-row items-start justify-between mb-2">
				<HText
					size="base"
					weight="bold"
					color="foreground"
					className="flex-1 pr-2"
					numberOfLines={1}
				>
					{task.title}
				</HText>

				<Pressable
					hitSlop={8}
					className="p-1"
					onPress={e => {
						e.stopPropagation();
						onOptionsPress?.();
					}}
				>
					<HugeiconsIcon
						icon={MoreVertical}
						size={20}
						color={String(mutedForeground)}
					/>
				</Pressable>
			</View>

			<View className="flex-row flex-wrap gap-2 mb-3">
				<View className="bg-primary/20 px-2.5 py-1 rounded-full">
					<HText size="xs" weight="medium" color="primary">
						{task.board?.name}
					</HText>
				</View>

				{task.priority != null && task.priority !== "" && (
					<View className="bg-red-100 px-2.5 py-1 rounded-full">
						<HText
							size="xs"
							weight="medium"
							className="text-red-600"
						>
							{task.priority}
						</HText>
					</View>
				)}
			</View>

			<View className="flex-row items-center gap-2 mb-3">
				<View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
					<View
						className="h-full rounded-full bg-primary"
						style={{
							width: `${Math.min(100, Math.max(0, task.progress))}%`,
						}}
					/>
				</View>
				<HText size="sm" weight="medium" color="foreground">
					{task.progress}%
				</HText>
			</View>

			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center">
					{visibleUsers?.map((user, index) => (
						<View
							key={user.id}
							className="rounded-full border-2 border-background shrink-0 bg-primary overflow-hidden"
							style={{
								marginLeft: index === 0 ? 0 : -OVERLAY_OFFSET,
							}}
						>
							<Image
								source={{ uri: user.avatar }}
								style={{
									width: AVATAR_SIZE,
									height: AVATAR_SIZE,
									borderRadius: AVATAR_SIZE / 2,
									backgroundColor: String(primaryColor),
								}}
							/>
						</View>
					))}

					{overflowCount > 0 && (
						<View
							className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background items-center justify-center shrink-0"
							style={{
								marginLeft:
									visibleUsers && visibleUsers.length > 0
										? -OVERLAY_OFFSET
										: 0,
							}}
						>
							<HText size="xs" weight="medium" color="primary">
								+{overflowCount}
							</HText>
						</View>
					)}
				</View>

				<View className="flex-row items-center gap-1">
					<HugeiconsIcon
						icon={Calendar03Icon}
						size={14}
						color={String(mutedForeground)}
					/>
					<HText size="xs" className="text-muted-foreground">
						{task.end_at ? dayjs(task.end_at).format("MMM D, YYYY") : "No due date"}
					</HText>
				</View>

				<View className="flex-row items-center gap-1">
					<HugeiconsIcon
						icon={Comment01Icon}
						size={14}
						color={String(mutedForeground)}
					/>
					<HText size="xs" className="text-muted-foreground">
						{task.comments?.length ?? 0} Comments
					</HText>
				</View>
			</View>
		</Pressable>
	);
}
