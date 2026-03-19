import { Link } from "expo-router";
import { ScrollView, View } from "react-native";

import HText from "@/components/text";
import HPressable from "@/components/pressable";

export default function MessagesIndexScreen() {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="p-6 gap-4"
			contentInsetAdjustmentBehavior="automatic"
		>
			<View className="gap-2">
				<HText size="2xl" weight="bold" color="foreground">
					Messages
				</HText>
				<HText size="sm" color="muted">
					Start a new conversation or open an existing chat.
				</HText>
			</View>
			<Link href="/messages/create" asChild>
				<HPressable
					variant="primary"
					size="lg"
					label="New message"
				/>
			</Link>
		</ScrollView>
	);
}
