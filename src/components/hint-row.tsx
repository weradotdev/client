import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm font-medium text-foreground">{title}</Text>
      <View className="rounded-lg py-0.5 px-2 bg-muted">
        {typeof hint === 'string' ? (
          <Text className="text-muted-foreground text-sm">{hint}</Text>
        ) : (
          hint
        )}
      </View>
    </View>
  );
}
