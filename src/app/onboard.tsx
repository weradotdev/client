import {
	Dimensions,
	FlatList,
	Image,
	KeyboardAvoidingView,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	Pressable,
	View,
} from "react-native";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Unsplash image URLs. Replace with local require() when you have illustration assets. */
const ONBOARD_ILLUSTRATIONS = {
	welcome:
		"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80",
	projects:
		"https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80",
	tasks:
		"https://images.unsplash.com/photo-1484480974693-6ca0a610fb2c?q=80",
	connect:
		"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80",
} as const;

type OnboardValues = { baseUrl: string };

type OnboardStep = {
	id: string;
	title: string;
	subtitle: string;
	imageKey: keyof typeof ONBOARD_ILLUSTRATIONS;
};

const STEPS: OnboardStep[] = [
	{
		id: "welcome",
		title: "Organize work your way",
		subtitle: "Track projects and tasks in one place. Simple, flexible, and built for how you work.",
		imageKey: "welcome",
	},
	{
		id: "projects",
		title: "Projects",
		subtitle: "Create projects to group related work. Add boards, invite your team, and keep everything in sync.",
		imageKey: "projects",
	},
	{
		id: "tasks",
		title: "Tasks & boards",
		subtitle: "Add tasks, set due dates, move cards across columns, and track progress at a glance.",
		imageKey: "tasks",
	},
];

export default function OnboardScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const baseUrl = useAuthStore((s) => s.baseUrl);
	const setBaseUrl = useAuthStore((s) => s.setBaseUrl);
	const setOnboarded = useAuthStore((s) => s.setOnboarded);

	const flatListRef = useRef<FlatList>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const isLastStep = currentIndex === STEPS.length; // STEPS + 1 connect step

	const onboardMutation = useMutation({
		mutationFn: async ({ baseUrl: url }: OnboardValues) => {
			const trimmed = url?.trim() ?? "";
			if (trimmed) setBaseUrl(trimmed);
			setOnboarded(true);
		},
		onSuccess: () => {
			router.replace("/(tabs)" as Href);
		},
	});

	const OnboardForm = useForm({
		defaultValues: { baseUrl } as OnboardValues,
		onSubmit: async ({ value }) => {
			onboardMutation.mutateAsync(value);
		},
	});

	const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const x = e.nativeEvent.contentOffset.x;
		const index = Math.round(x / SCREEN_WIDTH);
		setCurrentIndex(index);
	}, []);

	const goNext = useCallback(() => {
		if (isLastStep) {
			OnboardForm.handleSubmit();
			return;
		}
		const next = currentIndex + 1;
		flatListRef.current?.scrollToIndex({ index: next, animated: true });
		setCurrentIndex(next);
	}, [currentIndex, isLastStep, OnboardForm]);

	const goToEnd = useCallback(() => {
		flatListRef.current?.scrollToIndex({ index: STEPS.length, animated: true });
		setCurrentIndex(STEPS.length);
	}, []);

	const renderStep = useCallback(
		({ item }: { item: OnboardStep }) => (
			<View style={{ width: SCREEN_WIDTH }} className="flex-1 px-8 pt-8 pb-4">
				<View className="flex-1 justify-center items-center">
					<View
						className="aspect-square mb-8"
						style={{ width: SCREEN_WIDTH * 0.8, maxWidth: 360 }}
					>
						<Image
							source={{ uri: ONBOARD_ILLUSTRATIONS[item.imageKey] }}
							className="w-full h-full"
							resizeMode="contain"
						/>
					</View>
					<HText size="2xl" weight="bold" color="foreground" className="text-center">
						{item.title}
					</HText>
					<HText
						size="base"
						color="muted"
						className="text-center mt-3 max-w-sm"
					>
						{item.subtitle}
					</HText>
				</View>
			</View>
		),
		[],
	);

	const renderConnectStep = useCallback(
		() => (
			<View style={{ width: SCREEN_WIDTH }} className="flex-1 px-8 pt-8 pb-4">
				<View className="flex-1 justify-center max-w-sm self-center w-full">
					<View
						className="aspect-square mb-6 self-center"
						style={{ width: SCREEN_WIDTH * 0.8, maxWidth: 360 }}
					>
						<Image
							source={{ uri: ONBOARD_ILLUSTRATIONS.connect }}
							className="w-full h-full"
							resizeMode="contain"
						/>
					</View>
					<HText size="2xl" weight="bold" color="foreground">
						Connect your workspace
					</HText>
                    
					<HText size="sm" color="muted" className="mt-2">
						Enter your API base URL. You can change this later in settings.
					</HText>

					<OnboardForm.Field
						name="baseUrl"
						validators={{
							onChange: ({ value }) => {
								const v = value?.trim();
								if (!v) return "URL is required";
								try {
									new URL(v.startsWith("http") ? v : `https://${v}`);
								} catch {
									return "Enter a valid URL";
								}
								return undefined;
							},
						}}
					>
						{(baseUrlField) => (
							<View className="mt-6">
								<HTextInput
									label="Base URL"
									value={baseUrlField.state.value}
									onChangeText={(v) => baseUrlField.handleChange(v)}
									onBlur={baseUrlField.handleBlur}
									errors={baseUrlField.state.meta.errors}
									placeholder="https://api.example.com"
									autoCapitalize="none"
									keyboardType="url"
									autoComplete="off"
								/>
							</View>
						)}
					</OnboardForm.Field>
				</View>
			</View>
		),
		[OnboardForm],
	);

	const data: (OnboardStep & { id: string })[] = [
		...STEPS,
		{ id: "connect", title: "", subtitle: "", imageKey: "connect" },
	];

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: SCREEN_WIDTH,
			offset: SCREEN_WIDTH * index,
			index,
		}),
		[],
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-background"
		>
			<FlatList
				ref={flatListRef}
				data={data}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) =>
					item.id === "connect" ? renderConnectStep() : renderStep({ item: item as OnboardStep })}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={onScroll}
				scrollEventThrottle={16}
				getItemLayout={getItemLayout}
				keyboardShouldPersistTaps="handled"
			/>

			{/* Pagination dots */}
			<View className="flex-row justify-center gap-2 py-4">
				{data.map((_, index) => (
					<Pressable
						key={index}
						onPress={() => {
							flatListRef.current?.scrollToIndex({ index, animated: true });
							setCurrentIndex(index);
						}}
						className={twMerge(
							"rounded-full h-2",
							currentIndex === index ? "w-5 bg-primary" : "w-2 bg-primary/30",
						)}
					/>
				))}
			</View>

			{/* Bottom actions */}
			<View className="px-8 pt-2 gap-3" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
				{!isLastStep && (
					<Pressable onPress={goToEnd} className="py-2">
						<HText size="sm" color="muted" className="text-center">
							Skip for now
						</HText>
					</Pressable>
				)}
				
				<OnboardForm.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<HPressable
							label={
								isLastStep
									? isSubmitting || onboardMutation.isPending
										? "..."
										: "Continue"
									: "Next"
							}
							variant="primary"
							size="lg"
							disabled={isLastStep ? !canSubmit || onboardMutation.isPending : false}
							isLoading={isLastStep && (isSubmitting || onboardMutation.isPending)}
							onPress={goNext}
						/>
					)}
				</OnboardForm.Subscribe>
			</View>
		</KeyboardAvoidingView>
	);
}
