import { View } from "react-native";

/** Stub for a decorative curve. Replace with SVG if you add react-native-svg. */
export function OutwardCurveBottomRight({
	size = 80,
	fill = "#eeeeee",
}: {
	r?: number;
	s?: number;
	size?: number;
	fill?: string;
}) {
	return (
		<View
			style={{
				width: size,
				height: size,
				backgroundColor: fill,
				borderRadius: size / 2,
			}}
		/>
	);
}
