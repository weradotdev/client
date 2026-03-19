import "@/global.css";

import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Uniwind } from "uniwind";
import { useAuthStore } from "@/stores/auth";
import { useColorScheme } from "react-native";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			retry: 2,
		},
	},
});

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const onboarded = useAuthStore(s => s.onboarded);
	const authenticated = useAuthStore(s => s.authenticated);
	const currentProject = useAuthStore(s => s.currentProject);

	Uniwind.updateCSSVariables("light", {
		"--color-primary": currentProject?.color ?? "#0097b2",
	});

	return (
		<ThemeProvider
			value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
		>
			<QueryClientProvider client={queryClient}>
				<AnimatedSplashOverlay />

				<GestureHandlerRootView>
					<SafeAreaProvider>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Protected guard={authenticated}>
								{/* Hide root header so nested stacks (projects, messages, tasks, profile) can show their own; (tabs) has no header by design */}
								<Stack.Screen name="(tabs)" />
								<Stack.Screen name="profile" />
								<Stack.Screen name="projects" />
								<Stack.Screen name="messages" />
								<Stack.Screen name="tasks" />
							</Stack.Protected>

							<Stack.Protected guard={!authenticated}>
								<Stack.Protected guard={onboarded}>
									<Stack.Screen name="(guest)" />
								</Stack.Protected>

								<Stack.Protected guard={!onboarded}>
									<Stack.Screen name="onboard" />
								</Stack.Protected>
							</Stack.Protected>
						</Stack>

						<StatusBar style="auto" />
					</SafeAreaProvider>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
