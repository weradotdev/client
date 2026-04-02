import * as ImagePicker from "expo-image-picker";

import { useMutation } from "@tanstack/react-query";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { Stack } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

import HPressable from "@/components/pressable";
import HText from "@/components/text";
import { toast } from "@/components/toasts";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCSSVariable } from "uniwind";

type AvatarAsset = {
	fileName?: string | null;
	mimeType?: string;
	uri: string;
};

type AvatarUploadResponse = {
	message: string;
	user: User;
};

export default function avatar() {
	const primaryColor = useCSSVariable("--color-primary");
	const user = useAuthStore(s => s.user);
	const avatarUrl = useAuthStore(s => s.avatarUrl);
	const setUser = useAuthStore(s => s.setUser);
	const setAvatarUrl = useAuthStore(s => s.setAvatarUrl);
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const cameraRef = useRef<any>(null);
	const [facing, setFacing] = useState<CameraType>("front");
	const [cameraOpen, setCameraOpen] = useState(false);
	const [cameraReady, setCameraReady] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<AvatarAsset | null>(null);

	const previewUri =
		selectedAsset?.uri ?? avatarUrl ?? user?.avatar_url ?? user?.avatar ?? null;

	const uploadMutation = useMutation({
		mutationFn: async (asset: AvatarAsset) => {
			const formData = new FormData();
			const extension = asset.fileName?.split(".").pop() || "jpg";
			const fileName = asset.fileName || `avatar.${extension}`;
			const mimeType = asset.mimeType || `image/${extension === "jpg" ? "jpeg" : extension}`;

			formData.append("avatar", {
				name: fileName,
				type: mimeType,
				uri: asset.uri,
			} as never);

			return api().uploadRequest<AvatarUploadResponse>("auth/avatar", formData);
		},
		onSuccess: data => {
			setUser(data.user);
			setAvatarUrl(data.user.avatar_url ?? null);
			setSelectedAsset(null);
			toast.success("Avatar updated");
		},
		onError: error => {
			const message =
				error instanceof Error ? error.message : "Failed to upload avatar.";

			toast.error("Upload failed", undefined, message);
		},
	});

	const requestLibraryImage = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			toast.error("Permission required", undefined, "Media library access is required to choose an avatar.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1, 1],
			mediaTypes: ["images"],
			quality: 0.8,
		});

		if (result.canceled || !result.assets?.length) {
			return;
		}

		const asset = result.assets[0];

		setCameraOpen(false);
		setSelectedAsset({
			fileName: asset.fileName,
			mimeType: asset.mimeType,
			uri: asset.uri,
		});
	};

	const openCamera = async () => {
		if (!cameraPermission?.granted) {
			const permission = await requestCameraPermission();

			if (!permission.granted) {
				toast.error("Permission required", undefined, "Camera access is required to take an avatar photo.");
				return;
			}
		}

		setCameraReady(false);
		setCameraOpen(true);
	};

	const capturePhoto = async () => {
		if (!cameraReady || !cameraRef.current) {
			return;
		}

		try {
			const photo = await cameraRef.current.takePicture({
				mirror: facing === "front",
				quality: 0.8,
				shutterSound: false,
			});

			setSelectedAsset({
				fileName: `avatar-${Date.now()}.jpg`,
				mimeType: "image/jpeg",
				uri: photo.uri,
			});
			setCameraOpen(false);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to capture photo.";

			toast.error("Camera error", undefined, message);
		}
	};

	const screenOptions = useMemo(
		() => ({
			headerTitle: "Change avatar",
			presentation: "formSheet" as const,
			sheetGrabberVisible: true,
			contentStyle: { backgroundColor: "#fff" },
			sheetAllowedDetents: [0.75, 1.0],
			sheetCornerRadius: 24,
			headerTintColor: String(primaryColor),
		}),
		[primaryColor],
	);

	return (
		<>
			<Stack.Screen options={screenOptions} />

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
				showsVerticalScrollIndicator={false}
			>
				<HText size="sm" color="muted">
					Choose a photo from your library or take a new one. You can preview it before uploading.
				</HText>

				{cameraOpen ? (
					<View className="overflow-hidden rounded-[28px] bg-black" style={{ minHeight: 420 }}>
						<CameraView
							ref={cameraRef}
							className="h-105 w-full"
							facing={facing}
							mirror={facing === "front"}
							onCameraReady={() => setCameraReady(true)}
						/>

						<View className="absolute inset-x-0 bottom-0 gap-3 bg-black/45 px-4 pb-5 pt-4">
							<View className="flex-row items-center justify-between gap-3">
								<HPressable
									label="Cancel"
									onPress={() => setCameraOpen(false)}
									variant="tertiary"
									className="flex-1 bg-white/90"
									labelClassName="text-foreground"
								/>
								<HPressable
									label={facing === "front" ? "Use back camera" : "Use front camera"}
									onPress={() =>
										setFacing(current =>
											current === "front" ? "back" : "front",
										)
									}
									variant="outline"
									className="flex-1 border-white/60"
									labelClassName="text-white"
								/>
							</View>

							<HPressable
								label="Take photo"
								onPress={capturePhoto}
								isLoading={!cameraReady}
								className="bg-white"
								labelClassName="text-primary"
							/>
						</View>
					</View>
				) : (
					<View className="items-center gap-4 rounded-[28px] border border-border bg-muted/30 px-4 py-6">
						<View className="h-56 w-56 overflow-hidden rounded-full border border-primary/15 bg-white">
							{previewUri ? (
								<Image source={{ uri: previewUri }} className="h-full w-full" resizeMode="cover" />
							) : (
								<View className="h-full w-full items-center justify-center bg-primary/5">
									<HText size="base" color="muted">
										No avatar selected
									</HText>
								</View>
							)}
						</View>

						<View className="w-full gap-3">
							<HPressable label="Choose from library" onPress={requestLibraryImage} />
							<HPressable
								label="Open camera"
								onPress={openCamera}
								variant="outline"
							/>
							{selectedAsset ? (
								<Pressable
									onPress={() => setSelectedAsset(null)}
									className="items-center py-2 active:opacity-70"
								>
									<HText size="sm" color="muted">
										Discard selected photo
									</HText>
								</Pressable>
							) : null}
						</View>
					</View>
				)}

				<View className="gap-2 rounded-3xl border border-border bg-white px-4 py-4">
					<HText size="sm" weight="medium">
						Upload avatar
					</HText>
					<HText size="sm" color="muted">
						Square photos work best. Supported formats depend on your device camera and photo library.
					</HText>

					<HPressable
						label="Upload avatar"
						onPress={() => selectedAsset && uploadMutation.mutate(selectedAsset)}
						disabled={!selectedAsset || uploadMutation.isPending}
						isLoading={uploadMutation.isPending}
						className={!selectedAsset ? "opacity-50" : undefined}
					/>

					{uploadMutation.isPending ? (
						<View className="flex-row items-center justify-center gap-2 pt-1">
							<ActivityIndicator color={String(primaryColor)} size="small" />
							<HText size="sm" color="muted">
								Uploading avatar...
							</HText>
						</View>
					) : null}
				</View>
			</ScrollView>
		</>
	);
}
