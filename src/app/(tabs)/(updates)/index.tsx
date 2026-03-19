import {
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import { Link, Stack } from "expo-router";

import HTMLView from "react-native-htmlview";
import HText from "@/components/text";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export default function UpdatesTab() {
	const {
		data: projects,
		isLoading: isLoadingProjects,
		refetch: refetchProjects,
	} = useQuery({
		queryKey: ["projects"],
		queryFn: () => api<Project>("projects").search(),
		select: s => s.data,
	});

	const ProjectLogo = ({ conv }: { conv: Project }) =>
		!!conv.icon_url ? (
			<Image
				source={{ uri: conv.icon_url }}
				className="h-12 w-12 rounded-xl bg-background-element"
				resizeMode="cover"
			/>
		) : (
			<View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
				<HText size="sm" weight="bold" color="white">
					{conv.name
						.split(/\s+/)
						.map(w => w[0])
						.join("")
						.slice(0, 2)
						.toUpperCase()}
				</HText>
			</View>
		);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerTitle: "Updates",
					headerTintColor: "",
				}}
			/>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName="px-4 gap-2"
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={isLoadingProjects}
						onRefresh={refetchProjects}
					/>
				}
			>
				<HText size="sm" color="muted">
					Conversations by project
				</HText>

				<View className="gap-1">
					{projects?.map(conv => (
						<Link
							key={conv.id}
							href={{
								pathname: "/projects/[projectId]/chat",
								params: {
									projectId: String(conv.id),
									name: conv.name,
								},
							}}
							asChild
						>
							<Pressable className="flex-row gap-3 rounded-2xl bg-background-element py-4 active:opacity-80">
								<ProjectLogo conv={conv} />

								<View className="flex-1 min-w-0">
									<View className="flex-row items-center justify-between gap-2">
										<HText
											size="base"
											weight="semibold"
											color="foreground"
											numberOfLines={1}
										>
											{conv.name}
										</HText>
										
										<HText size="xs" color="muted">
											{formatDistanceToNow(
												conv.created_at,
												{
													addSuffix: true,
												},
											)}
										</HText>
									</View>

									{!!conv.last_comment && (
										<HTMLView
											value={conv.last_comment.body}
										/>
									)}

									<HText
										size="xs"
										color="muted"
										className="mt-1"
									>
										{conv.users.length} member
										{conv.users.length !== 1 ? "s" : ""}
									</HText>
								</View>
							</Pressable>
						</Link>
					))}
				</View>
			</ScrollView>
		</>
	);
}
