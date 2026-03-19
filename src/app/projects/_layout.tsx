import { Stack } from "expo-router";
export default function ProjectsLayout() {
	return (
		<Stack screenOptions={{ headerShown: true }}>
			<Stack.Screen
				name="create"
				options={{
					presentation: "formSheet",
					headerTitle: "New Project",
					sheetGrabberVisible: true,
					contentStyle: { backgroundColor: "transparent" },
					sheetAllowedDetents: [0.5, 0.75, 1.0],
					sheetCornerRadius: 24,
				}}
			/>
		</Stack>
	);
}
