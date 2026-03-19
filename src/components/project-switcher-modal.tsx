import { Modal, Pressable, ScrollView, View } from "react-native";

import HPressable from "./pressable";
import HText from "@/components/text";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import { useCSSVariable } from "uniwind";

type ProjectSwitcherModalProps = {
	visible: boolean;
	onClose: () => void;
	projects: Project[];
	currentProjectId: string | null;
	onSelectProject: (project: Project) => void;
};

export default function ProjectSwitcherModal({
	visible,
	onClose,
	projects,
	currentProjectId,
	onSelectProject,
}: ProjectSwitcherModalProps) {
	const primaryColor = useCSSVariable("--color-primary");
	const effectiveCurrentId = currentProjectId ?? projects[0]?.id ?? null;
	const currentProject = projects.find(p => p.id === effectiveCurrentId);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				className="flex-1 bg-black/50 justify-center px-6"
				onPress={onClose}
			>
				<Pressable
					className="bg-background rounded-2xl overflow-hidden max-h-[70%]"
					onPress={e => e.stopPropagation()}
				>
					<View className="px-5 pt-5 pb-2 border-b border-border">
						<HText size="sm" color="muted">
							Current project
						</HText>
						<HText size="xl" weight="bold" color="foreground">
							{currentProject?.name ?? "None"}
						</HText>
					</View>

					<ScrollView
						className="max-h-64"
						showsVerticalScrollIndicator={false}
					>
						{projects.map(project => {
							const isCurrent = project.id === effectiveCurrentId;
							return (
								<Pressable
									key={project.id}
									onPress={() => {
										if (!isCurrent) {
											onSelectProject(project);
											onClose();
										}
									}}
									className="flex-row items-center justify-between px-5 py-4 border-b border-border/60 active:bg-muted/50"
									disabled={isCurrent}
								>
									<HText
										size="base"
										weight={
											isCurrent ? "semibold" : "normal"
										}
										color={
											isCurrent ? "primary" : "foreground"
										}
									>
										{project.name}
									</HText>
									{isCurrent && (
										<HugeiconsIcon
											icon={Tick01Icon}
											size={22}
											color={String(primaryColor)}
										/>
									)}
								</Pressable>
							);
						})}
					</ScrollView>

					<View className="px-5 py-4 border-t border-border">
						<HPressable
							label="Done"
							variant="primary"
							size="lg"
							onPress={onClose}
						/>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
