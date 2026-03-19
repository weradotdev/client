import Svg, { Path } from "react-native-svg";

import { PropsWithChildren } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND_FALLBACK = "#ffffff";

export default function CurvedTabBar({
	children,
	backgroundColor: backgroundColorProp,
}: PropsWithChildren<{ backgroundColor?: string }>) {
	const fromTheme = useCSSVariable("--color-background");
	
	const backgroundColor =
		backgroundColorProp ??
		(typeof fromTheme === "string" ? fromTheme : null) ??
		BACKGROUND_FALLBACK;

	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				position: "relative",
				height: 90 + insets.bottom,
			}}
		>
			<Svg
				width="100%"
				height={75 + insets.bottom}
				viewBox="0 0 375 100"
				preserveAspectRatio="none"
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<Path
					d="M 0,20 Q 0,0 20,0 H 120 C 132,0 140,10 147,25 C 157,42 170,52 187.5,52 C 205,52 218,42 228,25 C 235,10 243,0 255,0 H 355 Q 375,0 375,20 V 70 H 0 Z"
					fill={String(backgroundColor)}
				/>
			</Svg>
		</View>
	);
}
