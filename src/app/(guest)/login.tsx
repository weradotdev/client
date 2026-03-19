import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons";
import { Href, Link, useRouter } from "expo-router";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { api, handleValidationErrors } from "@/lib/api";

import type { AuthTokenResponse } from "@/lib/models";
import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type LoginValues = {
	email: string;
	password: string;
};

export default function LoginScreen() {
	const router = useRouter();
	const setUser = useAuthStore(s => s.setUser);
	const setToken = useAuthStore(s => s.setToken);

	const [passwordVisible, setPasswordVisible] = useState(false);

	const loginMutation = useMutation({
		mutationFn: async ({ email, password }: LoginValues) => api().post<AuthTokenResponse>("auth/login", {
				email,
				password,
			}),
		onSuccess: (data) => {
			if (data?.token && data?.user) {
				setToken(data.token);
				setUser(data.user);
				
				router.replace("/(tabs)" as Href);
			}
		},
		onError: e => handleValidationErrors(e, LoginForm),
	});

	const LoginForm = useForm({
		defaultValues: { email: "", password: "" } as LoginValues,
		onSubmit: async ({ value }) => {
			loginMutation.mutateAsync(value);
		},
	});

	return (
        <KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-background"
		>
			<ScrollView
				className="flex-1"
				contentContainerClassName="p-6 pt-20 pb-40 gap-4"
				keyboardShouldPersistTaps="handled"
			>
				<Image
					source={require("@/assets/images/logo.png")}
					className="h-28 aspect-video self-center"
					resizeMode="contain"
				/>

				<View className="gap-2">
					<HText size="2xl" weight="bold" color="foreground">
						Sign in
					</HText>
					<HText size="sm" color="muted">
						Enter your email and password.
					</HText>
				</View>

				<LoginForm.Field
					name="email"
					validators={{
						onChange: ({ value }) =>
							!value
								? "Email is required"
								: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
									? "Enter a valid email"
									: undefined,
					}}
				>
					{emailField => (
						<HTextInput
							label="Email"
							value={emailField.state.value}
							onChangeText={v => emailField.handleChange(v)}
							onBlur={emailField.handleBlur}
							errors={emailField.state.meta.errors}
							placeholder="you@example.com"
							autoCapitalize="none"
							keyboardType="email-address"
							autoComplete="email"
						/>
					)}
				</LoginForm.Field>

				<LoginForm.Field
					name="password"
					validators={{
						onChange: ({ value }) =>
							!value ? "Password is required" : undefined,
					}}
				>
					{passwordField => (
						<HTextInput
							label="Password"
							value={passwordField.state.value}
							onChangeText={v => passwordField.handleChange(v)}
							onBlur={passwordField.handleBlur}
							errors={passwordField.state.meta.errors}
							placeholder="••••••••"
							secureTextEntry={!passwordVisible}
							autoComplete="password"
							autoCapitalize="none"
							rightIcon={
								<Pressable
									onPress={() =>
										setPasswordVisible(!passwordVisible)
									}
								>
									<HugeiconsIcon
										icon={
											passwordVisible ? EyeOff : EyeIcon
										}
										size={24}
										color="#9ca3af"
									/>
								</Pressable>
							}
						/>
					)}
				</LoginForm.Field>

				<LoginForm.Subscribe
					selector={state => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<HPressable
							label={isSubmitting ? "..." : "Sign in"}
							variant="primary"
							size="lg"
							disabled={!canSubmit || loginMutation.isPending}
							isLoading={isSubmitting || loginMutation.isPending}
							onPress={() => LoginForm.handleSubmit()}
						/>
					)}
				</LoginForm.Subscribe>

				<View className="flex-row flex-wrap justify-center items-center gap-1">
					<Link href="/(guest)/register" asChild>
						<HPressable
							variant="outline"
							size="lg"
							label="Don’t have an account? Create one"
						/>
					</Link>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
    );
}
