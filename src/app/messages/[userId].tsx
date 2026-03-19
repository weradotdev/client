import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { GiftedChat, type IMessage, type User } from "react-native-gifted-chat";

import { getContactById } from "@/data/contacts";
import { DUMMY_CHAT_MESSAGES } from "@/data/messages";
import { useAuthStore } from "@/stores/auth";

function toGiftedUser(id: string, name?: string, avatar?: string): User {
	return {
		_id: id,
		name: name ?? undefined,
		avatar: avatar ?? undefined,
	};
}

export default function ChatScreen() {
	const { userId } = useLocalSearchParams<{ userId: string }>();
	const headerHeight = useHeaderHeight();
	const authUser = useAuthStore(s => s.user);

	const contact = useMemo(
		() => (userId ? getContactById(userId) : undefined),
		[userId],
	);

	const currentUser: User = useMemo(
		() =>
			authUser
				? toGiftedUser(authUser.id, authUser.name ?? authUser.email)
				: { _id: "me" },
		[authUser],
	);

	const otherUser: User = useMemo(
		() =>
			contact
				? toGiftedUser(contact.id, contact.name, contact.avatar)
				: { _id: userId ?? "unknown" },
		[contact, userId],
	);

	const [messages, setMessages] = useState<IMessage[]>(() => {
		if (!contact) return [];
		const welcome: IMessage = {
			_id: "welcome",
			text: `You're now chatting with ${contact.name}.`,
			createdAt: new Date(),
			user: otherUser,
			system: true,
		};
		// Dummy messages: newest first (GiftedChat order)
		const dummy: IMessage[] = [...DUMMY_CHAT_MESSAGES]
			.reverse()
			.map((m, i) => ({
				_id: `dummy-${userId}-${i}`,
				text: m.text,
				createdAt: m.createdAt,
				user: m.from === "me" ? currentUser : otherUser,
			}));
		return [welcome, ...dummy];
	});

	const onSend = useCallback((newMessages: IMessage[] = []) => {
		setMessages(prev => GiftedChat.append(prev, newMessages));
	}, []);

	if (!userId) {
		return null;
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerBackTitle: "Messages",
					title: contact?.name ?? "Chat",
					presentation: "card",
				}}
			/>

			<GiftedChat
				messages={messages}
				onSend={onSend}
				user={currentUser}
				keyboardAvoidingViewProps={{
					keyboardVerticalOffset: headerHeight,
				}}
			/>
		</>
	);
}
