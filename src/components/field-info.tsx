import type { AnyFieldApi } from "@tanstack/react-form";
import { Text } from "react-native";

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
	return Array.isArray(field.state.meta.errors) ? (
		<>
			{field.state.meta.errors.map((error) => (
				<Text
					key={error.message}
					className="text-xs font-semibold italic text-red-500 dark:text-red-400 ml-2"
				>
					{error.message}
				</Text>
			))}
		</>
	) : (
		<Text className="text-xs italic text-gray-600 dark:text-gray-400 ml-2">
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<Text className="font-semibold text-xs italic text-red-500 dark:text-red-400">
					{(field.state.meta.errors as any[]).join(", ")}
				</Text>
			) : null}

			{field.state.meta.isValidating ? "Validating..." : null}
		</Text>
	);
}
