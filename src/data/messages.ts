/** Dummy messages for chat – replace with API when ready */

export type DummyMessageRaw = {
	text: string;
	from: "me" | "other";
	createdAt: Date;
};

/** Generic back‑and‑forth messages; use for any chat. */
export const DUMMY_CHAT_MESSAGES: DummyMessageRaw[] = [
	{ text: "Hey, how’s the project going?", from: "other", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
	{ text: "Going well, almost done with the first task.", from: "me", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000) },
	{ text: "Nice! Need any help with the next one?", from: "other", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
	{ text: "Could you review the API design when you have a minute?", from: "me", createdAt: new Date(Date.now() - 45 * 60 * 1000) },
	{ text: "Sure, I’ll take a look this afternoon.", from: "other", createdAt: new Date(Date.now() - 30 * 60 * 1000) },
	{ text: "Thanks!", from: "me", createdAt: new Date(Date.now() - 5 * 60 * 1000) },
];

/** Project chat: messages from multiple users (userId identifies sender). */
export type DummyProjectMessageRaw = {
	text: string;
	userId: string;
	userName: string;
	createdAt: Date;
};

export const DUMMY_PROJECT_CHAT_MESSAGES: DummyProjectMessageRaw[] = [
	{ text: "Hey team, welcome to the project chat.", userId: "2", userName: "Alex Morgan", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
	{ text: "Thanks! Where do we track the backlog?", userId: "3", userName: "Jordan Lee", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
	{ text: "We use the Tasks tab for this project.", userId: "me", userName: "Me", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60 * 1000) },
	{ text: "I've added the first batch of tasks.", userId: "2", userName: "Alex Morgan", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
	{ text: "I'll take the API design task.", userId: "4", userName: "Sam Taylor", createdAt: new Date(Date.now() - 45 * 60 * 1000) },
	{ text: "Sounds good, Sam. I'll handle the frontend.", userId: "me", userName: "Me", createdAt: new Date(Date.now() - 30 * 60 * 1000) },
];
