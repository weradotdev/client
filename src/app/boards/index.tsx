import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { FlatList, Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { HeaderBackButton } from "@react-navigation/elements";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";
import { useQuery } from "@tanstack/react-query";

export default function Board() {
	const router = useRouter();
	const primaryColor = useCSSVariable("--color-primary");
	const backgroundColor = useCSSVariable("--color-background");

	const [search, setSearch] = useState("");

	const currentProject = useAuthStore(s => s.currentProject);

	const {
		data: boards,
		refetch: refetchBoards,
		isFetching: isFetchingBoards,
	} = useQuery({
		queryKey: ["boards"],
		queryFn: () =>
			api<Board>("boards").search("", [
				"forProject",
				{ projectId: currentProject?.id },
			]),
	});

	const renderItem = useCallback(
		({ item }: { item: Board }) => (
			<View>
				<HText>{item.name}</HText>

				<HText>{item.description}</HText>
			</View>
		),
		[],
	);

	const ListHeader = useMemo(
		() => (
			<View className="px-4 pb-3 ios:hidden">
				<HTextInput
					leftIcon={
						<HugeiconsIcon
							icon={Search01Icon}
							size={20}
							color="#9ca3af"
						/>
					}
					placeholder="Search boards or projects"
					placeholderTextColor="#9ca3af"
					value={search}
					onChangeText={setSearch}
					returnKeyType="search"
				/>

				<HText size="sm" color="muted" className="my-2">
					{boards?.total}
				</HText>
			</View>
		),
		[search],
	);

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerBackTitle: "Back",
					headerShadowVisible: false,
					headerStyle: { backgroundColor: String(backgroundColor) },
					headerTitle: "Boards",
					headerLeft: () => (
						<HeaderBackButton
							tintColor={String(primaryColor)}
							onPress={() => router.back()}
						/>
					),
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/filter")}
							hitSlop={12}
							className="pr-4 py-2 flex-row items-center gap-2"
						>
							<HugeiconsIcon
								icon={FilterIcon}
								size={22}
								color={String(primaryColor)}
							/>
							<HText size="sm" weight="medium" color="primary">
								Filters
							</HText>
						</Pressable>
					),
					headerTintColor: String(primaryColor),
				}}
			/>

			<Stack.SearchBar
				placeholder="Search boards or projects"
				onChangeText={e => setSearch(e.nativeEvent.text)}
			/>

			<FlatList
				className="flex-1 px-3 bg-background"
				contentContainerClassName="pb-40 gap-4"
				data={boards?.data}
				renderItem={renderItem}
				ListHeaderComponent={ListHeader}
				ListEmptyComponent={
					<View className="px-4 py-12 items-center">
						<HText size="sm" color="muted" className="text-center">
							{search.trim()
								? "No boards match your search."
								: "No boards match the current filters."}
						</HText>

						<Pressable
							onPress={() => router.push("/filter")}
							className="mt-3"
						>
							<HText size="sm" weight="medium" color="primary">
								Change filters
							</HText>
						</Pressable>
					</View>
				}
				showsVerticalScrollIndicator={false}
			/>
		</>
	);
}
