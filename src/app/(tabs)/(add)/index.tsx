import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

import { BrandPurple } from "@/constants/theme";
import { SymbolView } from "expo-symbols";

export default function AddScreen() {
	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerTitle: "",
					headerTintColor: "",
				}}
			/>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName=""
			>
				{[
					{
						label: "Add Project",
						href: "/projects/create",
						backgroundColor: BrandPurple,
						textColor: "#fff",
						icon: "folder.badge.plus" as const,
					},
					{
						label: "Add Assignemt",
						href: "/tasks/create",
						backgroundColor: "#0EA590",
						textColor: "#fff",
						icon: "checkmark.circle.badge.plus" as const,
					},
					{
						label: "Add Message",
						href: "/messages/create",
						backgroundColor: "#22C55E",
						textColor: "#fff",
						icon: "bubble.left.and.bubble.right" as const,
					},
					{
						label: "Raise Ticket",
						href: "/tickets/create",
						backgroundColor: "#F59E0B",
						textColor: "#fff",
						icon: "exclamationmark.triangle" as const,
					},
				].map(row => (
					<Link key={row.href} href={row.href as any} asChild>
						<Pressable
							className="flex-row justify-between items-center px-4 py-16 active:opacity-90"
							style={{ backgroundColor: row.backgroundColor }}
						>
							<SymbolView
								name={row.icon}
								tintColor={row.textColor}
								size={64}
								weight="medium"
							/>
							
							<Text
								className="ml-3 text-3xl font-semibold"
								style={{ color: row.textColor }}
							>
								{row.label}
							</Text>
						</Pressable>
					</Link>
				))}
			</ScrollView>
		</>
	);
}
