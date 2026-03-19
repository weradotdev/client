import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { GiftedChat, IMessage, type User } from "react-native-gifted-chat";

import HPressable from "@/components/pressable";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { ReloadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { useCSSVariable } from "uniwind";

function toGiftedUser(id: string, name?: string, avatar?: string): User {
	return {
		_id: id,
		name: name ?? undefined,
		avatar: avatar ?? undefined,
	};
}

function toPlainMessageText(body: string): string {
	return body
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.trim();
}

export default function ProjectChatScreen() {
	const { projectId, name = "Project chat" } = useLocalSearchParams<{
		projectId: string;
		name: string;
	}>();

	const headerHeight = useHeaderHeight();
	const authUser = useAuthStore(s => s.user);

	const backgroundColor = useCSSVariable("--color-background");
	const primaryColor = useCSSVariable("--color-primary");

	const currentUser: User = useMemo(
		() =>
			authUser
				? toGiftedUser(
						String(authUser.id),
						authUser.name ?? authUser.email,
					)
				: { _id: "me" },
		[authUser],
	);

	const { data: comments, refetch: reloadMessages } = useQuery({
		queryKey: ["project", "comments", projectId],
		queryFn: async () =>
			api<Comment>(`projects/${projectId}/comments`).index(),
		enabled: !!projectId,
		refetchInterval: 30000,
	});

	const messages = useMemo(() => {
		return (comments?.data ?? [])
			.map(comment => {
				const authorId = comment.author?.id ?? `author-${comment.id}`;
				const text = toPlainMessageText(comment.body);

				return {
					_id: String(comment.id),
					text: text.length > 0 ? text : comment.body,
					createdAt: new Date(comment.created_at),
					user: toGiftedUser(
						String(authorId),
						comment.author?.name ??
							comment.author?.email ??
							"Unknown",
						comment.author?.avatar ?? undefined,
					),
				};
			})
			.reverse();
	}, [comments]);

	const onSend = async (newMessages: IMessage[]) => {
		const message = newMessages[0];
		if (!message || !message.text?.trim()) return;

		try {
			await api("comments").store({
				body: message.text,
				commentable_type: "project",
				commentable_id: projectId,
			});

			reloadMessages();
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerBackTitle: "Chat",
					headerShadowVisible: false,
					headerStyle: {
						backgroundColor: String(backgroundColor),
					},
					headerTintColor: String(primaryColor),
					title: name,
					// presentation: "formSheet",
					headerRight: () => (
						<HPressable
							variant="primary"
							size="icon"
							leftIcon={
								<HugeiconsIcon
									icon={ReloadIcon}
									size={20}
									color="white"
								/>
							}
							onPress={() => reloadMessages()}
						/>
					),
				}}
			/>

			<GiftedChat
				messages={messages}
				onSend={onSend}
				user={currentUser}
				keyboardAvoidingViewProps={{
					keyboardVerticalOffset: headerHeight,
				}}
				listProps={{
					contentContainerClassName: "pb-40",
				}}
				alwaysShowSend
				renderUsernameOnMessage
				isTyping={false}
				isUsernameVisible
			/>
		</>
	);
}
