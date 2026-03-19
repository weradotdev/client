import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

import HText from "@/components/text";
import HTextInput from "@/components/text-input";
import { Image } from "expo-image";
import { MOCK_CONTACTS } from "@/data/contacts";
import { useForm } from "@tanstack/react-form";

type CreateMessageValues = {
	search: string;
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map(n => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export default function CreateMessageScreen() {
	const { width } = useWindowDimensions();

	const CreateMessageForm = useForm({
		defaultValues: { search: "" } as CreateMessageValues,
		onSubmit: async () => {
			// Navigation is via Link per contact; no form submit needed
		},
	});

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: "New Message",
					presentation: "formSheet",
					sheetGrabberVisible: true,
					contentStyle: { backgroundColor: "transparent" },
					sheetAllowedDetents: [0.5, 0.75, 1.0],
					sheetCornerRadius: 24,
				}}
			/>

			<ScrollView
				className="flex-1 rounded-t-3xl overflow-hidden bg-background"
				contentContainerClassName="p-6 pt-4 pb-40 gap-4"
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				stickyHeaderIndices={[0]}
				StickyHeaderComponent={() => (
					<CreateMessageForm.Field name="search">
						{searchField => (
							<HTextInput
								label="Search contacts"
								value={searchField.state.value}
								onChangeText={v => searchField.handleChange(v)}
								onBlur={searchField.handleBlur}
								errors={searchField.state.meta.errors}
								placeholder="Name or email"
								autoCapitalize="none"
								autoComplete="off"
							/>
						)}
					</CreateMessageForm.Field>
				)}
			>
				<View className="gap-2">
					<HText size="sm" color="muted">
						Choose a contact to start a conversation.
					</HText>
				</View>

				<CreateMessageForm.Subscribe
					selector={state => state.values.search ?? ""}
				>
					{searchValue => {
						const filteredContacts = MOCK_CONTACTS.filter(c =>
							c.name
								.toLowerCase()
								.includes((searchValue || "").toLowerCase()),
						);

						return (
							<View className="gap-1 mt-6">
								{filteredContacts.map(contact => (
									<Link
										key={contact.id}
										href={`/messages/${contact.id}`}
										asChild
									>
										<Pressable className="flex-row items-center gap-3 px-4 active:opacity-80 min-h-16">
											<View
												className="rounded-full overflow-hidden bg-gray-200 items-center justify-center"
												style={{
													width: 48,
													height: 48,
												}}
											>
												{contact.avatar ? (
													<Image
														source={{
															uri: contact.avatar,
														}}
														style={{
															width: 48,
															height: 48,
														}}
														contentFit="cover"
													/>
												) : (
													<HText
														size="sm"
														weight="semibold"
														color="muted"
													>
														{getInitials(
															contact.name,
														)}
													</HText>
												)}
											</View>
											<HText
												size="base"
												weight="medium"
												color="foreground"
											>
												{contact.name}
											</HText>
										</Pressable>
									</Link>
								))}

								{filteredContacts.length === 0 && (
									<View className="px-4 py-8 items-center">
										<HText size="sm" color="muted">
											No contacts match your search.
										</HText>
									</View>
								)}
							</View>
						);
					}}
				</CreateMessageForm.Subscribe>
			</ScrollView>
		</>
	);
}
