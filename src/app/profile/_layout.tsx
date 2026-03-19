import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

export default function ProfileLayout() {
	const primaryColor = useCSSVariable("--color-primary");

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				headerStyle: { backgroundColor: "#ffffff" },
				headerTintColor: String(primaryColor),
			}}
		/>
	);
}
