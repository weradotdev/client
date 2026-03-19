import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";
import { useRouter } from "expo-router";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { api } from "@/lib/api";
import type { Task } from "@/lib/models";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateTaskValues = {
	title: string;
	description: string;
};

export default function CreateTaskScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const createTaskMutation = useMutation({
		mutationFn: async ({ title, description }: CreateTaskValues) => {
			const data = await api("tasks").store({
				title: title.trim(),
				description: description?.trim() || undefined,
			});
			return data as Task & { id?: number | string };
		},
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			router.replace(data?.id ? `/tasks/${data.id}` : "/tasks");
		},
	});

	const CreateTaskForm = useForm({
		defaultValues: { title: "", description: "" } as CreateTaskValues,
		onSubmit: async ({ value }) => {
			createTaskMutation.mutateAsync(value);
		},
	});

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-background"
		>
			<ScrollView
				className="flex-1"
				contentContainerClassName="p-6 pt-4 pb-40 gap-4"
				keyboardShouldPersistTaps="handled"
			>
				<View className="gap-2">
					<HText size="2xl" weight="bold" color="foreground">
						New Task
					</HText>
					<HText size="sm" color="muted">
						Add a title and optional description.
					</HText>
				</View>

				<CreateTaskForm.Field
					name="title"
					validators={{
						onChange: ({ value }) =>
							!value?.trim() ? "Title is required" : undefined,
					}}
				>
					{titleField => (
						<HTextInput
							label="Title"
							value={titleField.state.value}
							onChangeText={v => titleField.handleChange(v)}
							onBlur={titleField.handleBlur}
							errors={titleField.state.meta.errors}
							placeholder="Task title"
							autoComplete="off"
						/>
					)}
				</CreateTaskForm.Field>

				<CreateTaskForm.Field name="description">
					{descField => (
						<HTextInput
							label="Description (optional)"
							value={descField.state.value}
							onChangeText={v => descField.handleChange(v)}
							onBlur={descField.handleBlur}
							errors={descField.state.meta.errors}
							placeholder="Details or notes"
							multiline
							numberOfLines={3}
							className="min-h-24"
						/>
					)}
				</CreateTaskForm.Field>

				<CreateTaskForm.Subscribe
					selector={state => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<HPressable
							label={isSubmitting ? "..." : "Create task"}
							variant="primary"
							size="lg"
							disabled={!canSubmit || createTaskMutation.isPending}
							isLoading={isSubmitting || createTaskMutation.isPending}
							onPress={() => CreateTaskForm.handleSubmit()}
						/>
					)}
				</CreateTaskForm.Subscribe>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
