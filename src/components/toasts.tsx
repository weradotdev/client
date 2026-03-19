import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
	CheckmarkCircle01Icon,
	DangerIcon,
	InformationCircleIcon,
	Warning,
} from "@hugeicons/core-free-icons";
import React, { useEffect, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react-native";
import { OutwardCurveBottomRight } from "./outward-curve-shape";

// Placeholder for HugeIcons, replace with actual import
const HugeIcons = ({
	type,
	color = "#fff",
}: {
	type: ToastType;
	color: string;
}) => {
	switch (type) {
		case "info":
			return (
				<HugeiconsIcon
					icon={InformationCircleIcon}
					color={color}
					size={32}
				/>
			);
		case "success":
			return (
				<HugeiconsIcon
					icon={CheckmarkCircle01Icon}
					color={color}
					size={32}
				/>
			);
		case "error":
			return <HugeiconsIcon icon={DangerIcon} color={color} size={32} />;
		case "warning":
			return <HugeiconsIcon icon={Warning} color={color} size={32} />;
		default:
			return (
				<HugeiconsIcon
					icon={InformationCircleIcon}
					color={color}
					size={32}
				/>
			);
	}
};

type ToastType =
	| "default"
	| "info"
	| "success"
	| "error"
	| "warning"
	| "loading";

interface ToastAction {
	label: string;
	color?: string;
	bgColor?: string;
	onClick: () => void;
}

interface ToastOptions {
	action?: ToastAction;
	type?: ToastType;
	message: string;
	description?: string;
	id?: string;
	duration?: number;
}

interface Toast {
	action?: ToastAction;
	id: string;
	message: string;
	description?: string;
	type: ToastType;
	duration: number;
}

let addToast: (toast: Toast) => void;

const toast = (
	message: string,
	options?: Partial<ToastOptions>,
	description?: string,
) => {
	const id = Math.random().toString(36).slice(2, 9);
	const toastObj: Toast = {
		id,
		message,
		type: options?.type || "default",
		duration: options?.duration || 3000,
		description,
		action: options?.action,
	};
	if (addToast) addToast(toastObj);
	return id;
};

toast.info = (
	message: string,
	options?: Partial<ToastOptions>,
	description?: string,
) => {
	return toast(message, { ...options, type: "info" }, description);
};
toast.success = (
	message: string,
	options?: Partial<ToastOptions>,
	description?: string,
) => {
	return toast(message, { ...options, type: "success" }, description);
};
toast.error = (
	message: string,
	options?: Partial<ToastOptions>,
	description?: string,
) => {
	return toast(message, { ...options, type: "error" }, description);
};
toast.warning = (
	message: string,
	options?: Partial<ToastOptions>,
	description?: string,
) => {
	return toast(message, { ...options, type: "warning" }, description);
};

toast.promise = async function <T>(
	promise: Promise<T>,
	opts: {
		loading: string;
		success: string;
		error: string;
		duration?: number;
	},
): Promise<T> {
	const id = toast(opts.loading, {
		type: "loading",
		duration: opts.duration || 5000,
	});
	try {
		const result = await promise;
		toast.success(opts.success, { id, duration: opts.duration || 3000 });
		return result;
	} catch (err) {
		toast.error(opts.error, { id, duration: opts.duration || 3000 });
		throw err;
	}
};

export { toast };

interface ToastsProps {
	position?:
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "top-center"
		| "bottom-center";
	duration?: number;
}

export const Toasts: React.FC<ToastsProps> = ({
	position = "bottom-center",
	duration = 3000,
}) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	useEffect(() => {
		addToast = (toast: Toast) => {
			setToasts(prev => [...prev, toast]);

			setTimeout(
				() => {
					setToasts(prev => prev.filter(t => t.id !== toast.id));
				},
				typeof toast.duration === "number" ? toast.duration : duration,
			);
		};

		return () => {
			addToast = undefined as any;
		};
	}, []);

	const getPositionStyle = () => {
		const base: any = {
			position: "absolute",
			zIndex: 9999,
			width: "100%",
			pointerEvents: "none",
		};

		switch (position) {
			case "top-left":
				return { ...base, top: 16, left: 16, width: "100%" };
			case "top-right":
				return { ...base, top: 16, right: 16, width: "100%" };
			case "bottom-left":
				return { ...base, bottom: 16, left: 16, width: "100%" };
			case "bottom-right":
				return { ...base, bottom: 16, right: 16, width: "100%" };
			case "top-center":
				return {
					...base,
					top: 16,
					left: 0,
					right: 0,
					margin: "0 auto",
					width: "100%",
				};
			case "bottom-center":
				return {
					...base,
					bottom: 16,
					left: 0,
					right: 0,
					margin: "0 auto",
					width: "100%",
				};
			default:
				return { ...base, top: 16, right: 16, width: "100%" };
		}
	};

	const getColor = (type: ToastType) => {
		switch (type) {
			case "info":
				return "#2196f3";
			case "success":
				return "#4caf50";
			case "error":
				return "#f44336";
			case "warning":
				return "#ff9800";
			case "loading":
				return "#757575";
			default:
				return "#333";
		}
	};

	return (
		<View
			style={[
				{ flexDirection: "row", justifyContent: "center" },
				getPositionStyle(),
			]}
		>
			{toasts.map(toast => (
				<View
					key={toast.id}
					style={{
						backgroundColor: getColor(toast.type),
						flex: 1,
						marginVertical: 8,
						marginHorizontal: 16,
						padding: 12,
						borderRadius: 16,
						minWidth: 200,
						width: "100%",
						height: "auto",
						alignSelf: "flex-start",
						elevation: 2,
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					<View style={{ flexDirection: "column", flex: 1 }}>
						<Text
							style={{
								color: "#fff",
								fontWeight: "500",
								fontSize: 15,
							}}
						>
							{toast.message}
						</Text>

						{toast.description ? (
							<Text
								style={{
									color: "#fff",
									opacity: 0.85,
									fontSize: 12,
								}}
							>
								{toast.description}
							</Text>
						) : null}

						{toast.action ? (
							<View style={{ marginTop: 8 }}>
								<Pressable
									onPress={toast.action.onClick}
									style={{
										backgroundColor:
											toast.action.bgColor || "#fff",
										borderRadius: 6,
										alignSelf: "flex-start",
									}}
								>
									<Text
										style={{
											color:
												toast.action.color ||
												getColor(toast.type),
											paddingVertical: 6,
											paddingHorizontal: 16,
											fontWeight: "600",
											fontSize: 14,
										}}
									>
										{toast.action.label}
									</Text>
								</Pressable>
							</View>
						) : null}
					</View>

					<View
						style={{
							width: 80,
							height: "auto",
							position: "absolute",
							bottom: 0,
							right: 0,
						}}
					>
						<OutwardCurveBottomRight
							r={32}
							s={25}
							size={80}
							fill="#eeeeee"
						/>

						<Pressable
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        >
							{toast.type === "loading" ? (
								<ActivityIndicator
									size="small"
									color={getColor(toast.type)}
									style={{ marginRight: 8 }}
								/>
							) : (
								<HugeIcons
									type={toast.type}
									color={getColor(toast.type)}
								/>
							)}
						</Pressable>
					</View>
				</View>
			))}
		</View>
	);
};
