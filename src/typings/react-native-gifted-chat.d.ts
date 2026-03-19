/** Stub types to avoid type-checking the library's source (TS version mismatches). */
declare module "react-native-gifted-chat" {
	import type { ComponentType } from "react";

	export interface User {
		_id: string;
		name?: string;
		avatar?: string;
	}

	export interface IMessage {
		_id: string;
		text?: string;
		createdAt?: Date | number;
		user?: User;
		[key: string]: unknown;
	}

	type GiftedChatProps = {
		messages?: IMessage[];
		user?: User;
		onSend?: (messages: IMessage[]) => void;
		[key: string]: unknown;
	};
	export const GiftedChat: ComponentType<GiftedChatProps> & {
		append: (prev: IMessage[], next: IMessage[]) => IMessage[];
	};

	export const Bubble: ComponentType<Record<string, unknown>>;
}
