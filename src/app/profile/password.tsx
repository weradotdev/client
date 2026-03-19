import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import HPressable from "@/components/pressable";
import { useCSSVariable } from "uniwind";

export default function PasswordScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const isValid =
		currentPassword.length > 0 &&
		newPassword.length >= 8 &&
		newPassword === confirmPassword;

	const screenOptions = useMemo(
		() => ({
			headerShown: true,
			headerShadowVisible: false,
			title: "Change password",
			headerTitleAlign: "center" as const,
			headerLeft: () => (
				<HeaderBackButton
					tintColor={String(primaryColor)}
					onPress={() => router.back()}
				/>
			),
			headerStyle: { backgroundColor: "#ffffff" },
			headerTintColor: String(primaryColor),
		}),
		[primaryColor, router],
	);

	const handleSubmit = useCallback(async () => {
		setError("");
		if (newPassword !== confirmPassword) {
			setError("New passwords do not match.");
			return;
		}
		if (newPassword.length < 8) {
			setError("New password must be at least 8 characters.");
			return;
		}
		setSubmitting(true);
		// In a real app: call API to change password
		await new Promise(r => setTimeout(r, 600));
		setSubmitting(false);
		router.back();
	}, [newPassword, confirmPassword, router]);

	return (
		<>
			<Stack.Screen options={screenOptions} />
			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<HText size="sm" color="muted" className="mb-2">
					Current password
				</HText>
				<HTextInput
					placeholder="Enter current password"
					value={currentPassword}
					onChangeText={setCurrentPassword}
					secureTextEntry
					className="mb-6"
				/>

				<HText size="sm" color="muted" className="mb-2">
					New password
				</HText>
				<HTextInput
					placeholder="At least 8 characters"
					value={newPassword}
					onChangeText={setNewPassword}
					secureTextEntry
					className="mb-6"
				/>

				<HText size="sm" color="muted" className="mb-2">
					Confirm new password
				</HText>
				<HTextInput
					placeholder="Confirm new password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
					className="mb-4"
				/>

				{error ? (
					<HText size="sm" color="danger" className="mb-4">
						{error}
					</HText>
				) : null}

				<View className="gap-3">
					<HPressable
						label="Update password"
						variant="primary"
						size="lg"
						onPress={handleSubmit}
						isLoading={submitting}
						disabled={!isValid || submitting}
					/>
				</View>
			</ScrollView>
		</>
	);
}
