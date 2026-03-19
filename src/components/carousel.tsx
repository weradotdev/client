import Animated, {
	Extrapolation,
	SharedValue,
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import {
	Dimensions,
	Image,
	Pressable,
	View,
} from "react-native";
import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";

export default function Carousel<
	T extends { title: string; image_url: string; link: string },
>({
	items,
	interval = 3000,
	renderItem,
	renderFooter = () => null,
	showPagination = false,
	onItemPress,
}: {
	items: T[];
	interval?: number;
	renderItem?: ({ item, index }: { item: T; index: number }) => ReactNode;
	renderFooter?: (index: number) => ReactNode;
	onItemPress: (item: T) => void;
	showPagination?: boolean;
}) {
	const { width } = Dimensions.get("screen");

	const scrollX = useSharedValue<number>(0);

	const flatListRef = useRef<any>(null);
	const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
	const currentAutoPlayIndex = useRef<number>(0);

	// Create infinite scroll by duplicating items
	const infiniteItems = [...items, ...items, ...items];
	const originalLength = items.length;

	// Autoplay function
	const startAutoPlay = useCallback(() => {
		if (autoPlayTimer.current) {
			clearInterval(autoPlayTimer.current);
		}

		autoPlayTimer.current = setInterval(() => {
			currentAutoPlayIndex.current =
				(currentAutoPlayIndex.current + 1) % originalLength;
			const targetIndex = currentAutoPlayIndex.current + originalLength;

			flatListRef.current?.scrollToIndex({
				index: targetIndex,
				animated: true,
			});
		}, interval);
	}, [originalLength]);

	const stopAutoPlay = useCallback(() => {
		if (autoPlayTimer.current) {
			clearInterval(autoPlayTimer.current);
			autoPlayTimer.current = null;
		}
	}, []);

	useEffect(() => {
		// Ensure FlatList is positioned at the middle section initially
		if (flatListRef.current && originalLength > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: originalLength,
					animated: false,
				});
			}, 100);
		}
	}, [originalLength]);

	useEffect(() => {
		// Start autoplay after a short delay to ensure FlatList is ready
		const timer = setTimeout(() => {
			startAutoPlay();
		}, 500);

		return () => {
			clearTimeout(timer);
			stopAutoPlay();
		};
	}, [startAutoPlay, stopAutoPlay]);

	const SlideItem = ({ item, index }: { item: T; index: number }) => {
		const animatedStyle = useAnimatedStyle(() => ({
			transform: [
				{
					translateX: interpolate(
						scrollX.value,
						[
							(index - 1) * width,
							index * width,
							(index + 1) * width,
						],
						[0, 0, 0],
						Extrapolation.CLAMP,
					),
				},
			],
		}));

		return (
			<Animated.View
				className="w-full h-full justify-center items-center"
				style={animatedStyle}
			>
				<Pressable
					className="w-full h-full rounded-3xl"
					onPress={() => onItemPress(item)}
				>
					<Image
						source={{ uri: item.image_url }}
						className="rounded-3xl w-full h-full relative"
						resizeMode="cover"
					/>
					{renderFooter(index)}
				</Pressable>
			</Animated.View>
		);
	};

	const PaginationDot = ({
		index,
		scrollX,
	}: {
		index: number;
		scrollX: SharedValue<number>;
	}) => {
		const isActive = scrollX.value === index;

		const animatedStyle = useAnimatedStyle(() => ({
			width: withTiming(isActive ? 24 : 8, { duration: 300 }),
			backgroundColor: isActive ? "#e52836" : "#d1d5db",
		}));

		return (
			<Animated.View style={animatedStyle} className="h-2 rounded-full" />
		);
	};

	const handleScroll = useAnimatedScrollHandler({
		onScroll: (event: any) => {
			const contentOffsetX = event.contentOffset.x;
			const currentIndex = Math.round(contentOffsetX / width);

			// Map infinite scroll index back to original index
			const originalIndex = currentIndex % originalLength;

			scrollX.value = originalIndex;
		},
	});

	const viewabilityConfigCallbackPairs = useMemo(
		() => [
			{
				viewabilityConfig: {
					itemVisiblePercentThreshold: 50,
				},
				onViewableItemsChanged: ({ viewableItems }: any) => {
					if (viewableItems.length > 0) {
						const visibleIndex =
							viewableItems[0].index % originalLength;
						currentAutoPlayIndex.current = visibleIndex;
						scrollX.value = visibleIndex;
					}
				},
			},
		],
		[originalLength],
	);

	const handleMomentumScrollEnd = (event: any) => {
		const contentOffsetX = event.nativeEvent.contentOffset.x;
		const currentIndex = Math.round(contentOffsetX / width);

		// Update autoplay index
		currentAutoPlayIndex.current = currentIndex % originalLength;

		// Handle infinite scroll looping
		if (currentIndex >= originalLength * 2) {
			// We've reached the end of the duplicated section, jump back to middle
			const originalIndex = currentIndex % originalLength;
			flatListRef.current?.scrollToIndex({
				index: originalLength + originalIndex,
				animated: false,
			});
		} else if (currentIndex < originalLength) {
			// We've reached the beginning of the duplicated section, jump to middle
			const originalIndex = currentIndex % originalLength;
			flatListRef.current?.scrollToIndex({
				index: originalLength + originalIndex,
				animated: false,
			});
		}

		// Resume autoplay
		startAutoPlay();
	};

	return (
		<>
			<Animated.FlatList
				ref={flatListRef}
				data={infiniteItems}
				horizontal
				pagingEnabled
				className="w-full"
				contentContainerStyle={{
					width: infiniteItems.length * width,
				}}
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				onMomentumScrollEnd={handleMomentumScrollEnd}
				viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
				keyExtractor={(item, index) => `${item.image_url}-${index}`}
				renderItem={({ item, index }) =>
					!!renderItem ? (
						renderItem({ item, index: index % originalLength })
					) : (
						<SlideItem item={item} index={index % originalLength} />
					)
				}
				initialScrollIndex={originalLength}
				getItemLayout={(_, index) => ({
					length: width,
					offset: width * index,
					index,
				})}
				onScrollBeginDrag={stopAutoPlay}
				ListFooterComponent={renderFooter}
			/>

			{showPagination && (
				<View className="flex-row items-center justify-center gap-2">
					{items.map((_, dot) => (
						<PaginationDot
							key={dot}
							index={dot}
							scrollX={scrollX}
						/>
					))}
				</View>
			)}
		</>
	);
}
