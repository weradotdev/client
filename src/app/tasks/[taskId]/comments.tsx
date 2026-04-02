import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { HeaderBackButton } from "@react-navigation/elements";
import { Image } from "react-native";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import {
	useTasksStore,
} from "@/stores/tasks";

const DEFAULT_AVATAR =
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";

export default function TaskCommentsScreen() {
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");

	const { taskId } = useLocalSearchParams<{ taskId: string }>();
	const queryClient = useQueryClient();
	const authUser = useAuthStore((s: { user: User | null }) => s.user);
	const getComments = useTasksStore((s) => s.getComments);
	const addComment = useTasksStore((s) => s.addComment);

	const [text, setText] = useState("");

	const { data: comments = [], isLoading } = useQuery({
		queryKey: ["comments", taskId],
		queryFn: () => getComments(taskId ?? ""),
		enabled: !!taskId,
	});

	const addCommentMutation = useMutation({
		mutationFn: async (payload: {
			author: string;
			avatar: string;
			text: string;
		}) => {
			addComment(taskId ?? "", payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
			setText("");
		},
	});

	const author = authUser?.name ?? authUser?.email ?? "You";
	const avatar = DEFAULT_AVATAR;

	const handleSubmit = useCallback(() => {
		const trimmed = text.trim();
		if (!trimmed) return;
		addCommentMutation.mutate({ author, avatar, text: trimmed });
	}, [text, author, avatar, addCommentMutation]);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Comments",
					headerTitleAlign: "center",
					headerShadowVisible: false,
					headerLeft: () => (
						<HeaderBackButton
							tintColor={String(primaryColor)}
							onPress={() => router.back()}
						/>
					),
					headerStyle: { backgroundColor: String(backgroundColor) },
					headerTintColor: String(primaryColor),
				}}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-background"
			>
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						paddingHorizontal: Spacing.four,
						paddingBottom: Spacing.six + 24,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{/* Add comment form at top */}
					<View className="pt-4 pb-6 gap-3">
						<HText size="sm" weight="medium" color="foreground">
							Add a comment
						</HText>
						<HTextInput
							placeholder="Write a comment..."
							value={text}
							onChangeText={setText}
							multiline
							numberOfLines={3}
							size="md"
							className="min-h-24"
						/>
						<HPressable
							label="Post comment"
							variant="primary"
							size="md"
							onPress={handleSubmit}
							disabled={
								!text.trim() || addCommentMutation.isPending
							}
							isLoading={addCommentMutation.isPending}
						/>
					</View>

					{/* Comments list (reverse order – newest first) */}
					<View className="border-t border-border pt-6">
						<HText
							size="base"
							weight="bold"
							color="foreground"
							className="mb-4"
						>
							All comments
						</HText>
						{isLoading ? (
							<HText size="sm" color="muted">
								Loading…
							</HText>
						) : comments.length === 0 ? (
							<HText size="sm" color="muted">
								No comments yet.
							</HText>
						) : (
							<View className="gap-4">
								{comments.map((comment: Comment) => (
									<View
										key={comment.id}
										className="flex-row gap-3"
									>
										<Image
											source={{ uri: comment.author?.avatar_url ?? DEFAULT_AVATAR }}
											style={{
												width: 40,
												height: 40,
												borderRadius: 20,
											}}
										/>
										<View className="flex-1 min-w-0">
											<View className="flex-row items-baseline justify-between gap-2 mb-0.5">
												<HText
													size="sm"
													weight="bold"
													color="foreground"
												>
													{comment.author?.name}
												</HText>
												<HText size="xs" color="muted">
													{comment.timeAgo}
												</HText>
											</View>
											<HText
												size="sm"
												color="foreground-secondary"
												className="leading-snug"
											>
												{comment.text}
											</HText>
										</View>
									</View>
								))}
							</View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</>
	);
}
