import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollOffset,
} from "react-native-reanimated";
import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, View } from "react-native";

import { twMerge } from "tailwind-merge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ParallaxScrollView({
	children,
	headerComponent,
	headerHeight = 250,
	headerClassName = "bg-primary",
	contentClassName,
	onRefresh,
	refreshing = false,
}: PropsWithChildren<{
	headerComponent: ReactNode;
	headerHeight?: number;
	headerClassName?: string;
	contentClassName?: string;
	onRefresh?: () => void;
	refreshing?: boolean;
}>) {
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollOffset = useScrollOffset(scrollRef);
	const bottom = useSafeAreaInsets().bottom;

	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[-headerHeight, 0, headerHeight],
						[-headerHeight / 2, 0, headerHeight * 0.75],
					),
				},
				{
					scale: interpolate(
						scrollOffset.value,
						[-headerHeight, 0, headerHeight],
						[2, 1, 1],
					),
				},
			],
		};
	});

	return (
		<Animated.ScrollView
			ref={scrollRef}
			scrollEventThrottle={16}
			scrollIndicatorInsets={{ bottom }}
			className="flex-1 bg-background"
			contentContainerClassName="pb-40"
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<Animated.View
				className={twMerge("overflow-hidden", headerClassName)}
				style={headerAnimatedStyle}
			>
				{headerComponent}
			</Animated.View>

			<View
				className={twMerge(
					"flex-1 p-4 gap-4 overflow-hidden bg-background rounded-3xl",
					contentClassName,
				)}
			>
				{children}
			</View>
		</Animated.ScrollView>
	);
}
