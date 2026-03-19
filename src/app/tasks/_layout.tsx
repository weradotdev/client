import { Stack } from "expo-router";

const formSheetOptions = {
	presentation: "formSheet" as const,
	sheetGrabberVisible: true,
	contentStyle: { backgroundColor: "transparent" },
	sheetAllowedDetents: [0.5, 0.75, 1.0],
	sheetCornerRadius: 24,
};

export default function TasksLayout() {
	return (
		<Stack screenOptions={{ headerShown: true }}>
			<Stack.Screen name="create" options={formSheetOptions} />
		</Stack>
	);
}
