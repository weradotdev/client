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
import type { Project } from "@/lib/models";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateProjectValues = {
	name: string;
	description: string;
};

export default function CreateProjectScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const createProjectMutation = useMutation({
		mutationFn: async ({ name, description }: CreateProjectValues) => {
			const data = await api("projects").store({
				name: name.trim(),
				description: (description?.trim() || undefined) as string,
			});
			return data as Project & { id?: number | string };
		},
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			router.replace(data?.id ? `/projects/${data.id}` : "/projects");
		},
	});

	const CreateProjectForm = useForm({
		defaultValues: { name: "", description: "" } as CreateProjectValues,
		onSubmit: async ({ value }) => {
			createProjectMutation.mutateAsync(value);
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
						New Project
					</HText>
					
					<HText size="sm" color="muted">
						Add a name and optional description.
					</HText>
				</View>

				<CreateProjectForm.Field
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
							placeholder="Project name"
							autoComplete="off"
						/>
					)}
				</CreateProjectForm.Field>

				<CreateProjectForm.Field name="description">
					{descField => (
						<HTextInput
							label="Description (optional)"
							value={descField.state.value}
							onChangeText={v => descField.handleChange(v)}
							onBlur={descField.handleBlur}
							errors={descField.state.meta.errors}
							placeholder="Brief description"
							multiline
							numberOfLines={3}
							className="min-h-24"
						/>
					)}
				</CreateProjectForm.Field>

				<CreateProjectForm.Subscribe
					selector={state => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<HPressable
							label={isSubmitting ? "..." : "Create project"}
							variant="primary"
							size="lg"
							disabled={!canSubmit || createProjectMutation.isPending}
							isLoading={isSubmitting || createProjectMutation.isPending}
							onPress={() => CreateProjectForm.handleSubmit()}
						/>
					)}
				</CreateProjectForm.Subscribe>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
