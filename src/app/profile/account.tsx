import { ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { HeaderBackButton } from "@react-navigation/elements";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useForm } from "@tanstack/react-form";

export default function AccountScreen() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");
	const user = useAuthStore(s => s.user);
	const setUser = useAuthStore(s => s.setUser);

	const baseUrl = useAuthStore(s => s.baseUrl);
	const setBaseUrl = useAuthStore(s => s.setBaseUrl);

	const AccountForm = useForm({
		defaultValues: {
			first_name: user?.first_name || "",
			last_name: user?.last_name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			gender: user?.gender || "",
			dob: user?.dob || "",
		},
		onSubmit: async ({ value }) => {
			setUser({
				...user,
				id: user?.id || 0,
				name: `${value.first_name} ${value.last_name}`.trim(),
				first_name: value?.first_name?.trim() || "",
				last_name: value?.last_name?.trim() || "",
				email: value?.email?.trim() || "",
				phone: value?.phone?.trim() || "",
				gender: value?.gender || "",
				dob: value?.dob || "",
				type: user?.type || "developer",
				avatar: user?.avatar || "",
				avatar_url: user?.avatar_url || "",
			});
		},
	});

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					title: "Account",
					headerTitleAlign: "center",
					headerLeft: () => (
						<HeaderBackButton
							tintColor={String(primaryColor)}
							onPress={() => router.back()}
						/>
					),
					headerStyle: { backgroundColor: "#ffffff" },
					headerTintColor: String(primaryColor),
				}}
			/>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<HText size="sm" color="muted" className="mb-2">
					Display name
				</HText>

				<AccountForm.Field name="first_name">
					{firstNameField => (
						<HTextInput
							placeholder="First name"
							value={firstNameField.state.value}
							onChangeText={firstNameField.handleChange}
							autoCapitalize="words"
							className="mb-6"
						/>
					)}
				</AccountForm.Field>

				<AccountForm.Field name="last_name">
					{lastNameField => (
						<HTextInput
							placeholder="Last name"
							value={lastNameField.state.value}
							onChangeText={lastNameField.handleChange}
							autoCapitalize="words"
							className="mb-6"
						/>
					)}
				</AccountForm.Field>

				<HText size="sm" color="muted" className="mb-2">
					Email
				</HText>

				<AccountForm.Field name="email">
					{emailField => (
						<HTextInput
							placeholder="you@example.com"
							value={emailField.state.value}
							onChangeText={emailField.handleChange}
							keyboardType="email-address"
							autoCapitalize="none"
							className="mb-8"
						/>
					)}
				</AccountForm.Field>

				<HText size="sm" color="muted" className="mb-2">
					Phone
				</HText>
				<AccountForm.Field name="phone">
					{phoneField => (
						<HTextInput
							placeholder="Your phone number"
							value={phoneField.state.value}
							onChangeText={phoneField.handleChange}
							keyboardType="phone-pad"
							autoCapitalize="none"
							className="mb-8"
						/>
					)}
				</AccountForm.Field>

				<HText size="sm" color="muted" className="mb-4">
					Base API URL
				</HText>

				<HTextInput
					placeholder="https://api.wera.dev"
					value={baseUrl}
					className="mb-8 bg-background-element"
					onChangeText={setBaseUrl}
				/>

				<AccountForm.Subscribe>
					{({ canSubmit, isSubmitting }) => (
						<HPressable
							onPress={AccountForm.handleSubmit}
							disabled={!canSubmit || isSubmitting}
							isLoading={isSubmitting}
							className="bg-primary p-4 rounded"
							label="Save"
						/>
					)}
				</AccountForm.Subscribe>
			</ScrollView>
		</>
	);
}
