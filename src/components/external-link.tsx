import { Href, Link } from "expo-router";
import {
	openBrowserAsync,
	WebBrowserPresentationStyle,
} from "expo-web-browser";
import { type ComponentProps } from "react";

export function ExternalLink({
	href,
	...rest
}: Omit<ComponentProps<typeof Link>, "href"> & {
	href: Href & string;
}) {
	return (
		<Link
			target="_blank"
			{...rest}
			href={href}
			onPress={async event => {
				if (process.env.EXPO_OS !== "web") {
					event.preventDefault();

					await openBrowserAsync(href, {
						presentationStyle:
							WebBrowserPresentationStyle.AUTOMATIC,
					});
				}
			}}
		/>
	);
}
