import { Image, ScrollView, View } from "react-native";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import { Link } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function GuestIndexScreen() {
	const setOnboarded = useAuthStore(s => s.setOnboarded);

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="flex-1 justify-center p-6"
			keyboardShouldPersistTaps="handled"
		>
			<Image
				source={require("@/assets/images/logo.png")}
				className="h-28 aspect-video self-center"
				resizeMode="contain"
			/>

			<View className="gap-8 max-w-sm w-full self-center">
				<View className="gap-2">
					<HText size="3xl" weight="bold" color="foreground">
						Welcome
					</HText>
					<HText size="base" color="muted">
						Sign in to your account or create one to get started.
					</HText>
				</View>

				<View className="gap-3">
					<Link
						href="/(guest)/login"
						onPressIn={() => setOnboarded(true)}
						asChild
					>
						<HPressable
							label="Sign in"
							variant="primary"
							size="lg"
						/>
					</Link>

					<Link
						href="/(guest)/register"
						onPressIn={() => setOnboarded(true)}
						asChild
					>
						<HPressable
							label="Create account"
							variant="outline"
							size="lg"
						/>
					</Link>
					
					<Link href="/onboard" asChild>
						<HPressable
							label="Set up server URL"
							variant="tertiary"
							size="lg"
						/>
					</Link>
				</View>
			</View>
		</ScrollView>
	);
}
