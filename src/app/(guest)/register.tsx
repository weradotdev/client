import { Href, Link, useRouter } from "expo-router";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";

import type { AuthTokenResponse } from "@/lib/models";
import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

type RegisterValues = {
	name: string;
	email: string;
	password: string;
};

export default function RegisterScreen() {
	const router = useRouter();
	const setToken = useAuthStore(s => s.setToken);
	const setUser = useAuthStore(s => s.setUser);

	const registerMutation = useMutation({
		mutationFn: async ({ name, email, password }: RegisterValues) =>
			api().post<AuthTokenResponse>("auth/register", {
				name: name || email.split("@")[0],
				email,
				password,
			}),
		onSuccess: data => {
			if (data?.token && data?.user) {
				setToken(data.token);
				setUser(data.user);
				
				router.replace("/(tabs)" as Href);
			}
		},
	});

	const RegisterForm = useForm({
		defaultValues: { name: "", email: "", password: "" } as RegisterValues,
		onSubmit: async ({ value }) => {
			registerMutation.mutateAsync(value);
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
				<View className="gap-6 max-w-sm w-full self-center">
					<View className="gap-2">
						<HText size="2xl" weight="bold" color="foreground">
							Create account
						</HText>
						<HText size="sm" color="muted">
							Enter your details to get started.
						</HText>
					</View>

					<RegisterForm.Field
						name="name"
						validators={{
							onChange: ({ value }) =>
								!value?.trim() ? "Name is required" : undefined,
						}}
					>
						{nameField => (
							<HTextInput
								label="Name"
								value={nameField.state.value}
								onChangeText={v => nameField.handleChange(v)}
								onBlur={nameField.handleBlur}
								errors={nameField.state.meta.errors}
								placeholder="Your name"
								autoComplete="name"
							/>
						)}
					</RegisterForm.Field>

					<RegisterForm.Field
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
					</RegisterForm.Field>

					<RegisterForm.Field
						name="password"
						validators={{
							onChange: ({ value }) =>
								!value
									? "Password is required"
									: value.length < 8
										? "Password must be at least 8 characters"
										: undefined,
						}}
					>
						{passwordField => (
							<HTextInput
								label="Password"
								value={passwordField.state.value}
								onChangeText={v =>
									passwordField.handleChange(v)
								}
								onBlur={passwordField.handleBlur}
								errors={passwordField.state.meta.errors}
								placeholder="••••••••"
								secureTextEntry
								autoComplete="password-new"
							/>
						)}
					</RegisterForm.Field>

					<RegisterForm.Subscribe
						selector={state => [
							state.canSubmit,
							state.isSubmitting,
						]}
					>
						{([canSubmit, isSubmitting]) => (
							<HPressable
								label={isSubmitting ? "..." : "Create account"}
								variant="primary"
								size="lg"
								disabled={
									!canSubmit || registerMutation.isPending
								}
								isLoading={
									isSubmitting || registerMutation.isPending
								}
								onPress={() => RegisterForm.handleSubmit()}
							/>
						)}
					</RegisterForm.Subscribe>

					<View className="flex-row flex-wrap justify-center items-center gap-1">
						<Link href="/(guest)/login" asChild>
							<HPressable
								variant="outline"
								size="lg"
								label="Already have an account? Sign in"
							/>
						</Link>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
