import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Link, Stack } from "expo-router";

import HText from "@/components/text";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";

function getProjectInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProjectsIndex() {
  const user = useAuthStore(state => state.user);

  const {
    data: projects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api<Project>("projects").search("", ["forUser", { userId: user?.id }]),
    select: result => result.data,
  });

  const projectList = projects ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Projects",
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 py-4 gap-3"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {projectList.length === 0 ? (
          <View className="rounded-2xl border border-border bg-background-element p-4">
            <HText size="base" color="muted">
              No projects yet.
            </HText>
          </View>
        ) : (
          projectList.map(project => (
            <Link key={String(project.id)} href={`/projects/${project.id}`} asChild>
              <Pressable className="flex-row items-center gap-3 rounded-2xl border border-border bg-background-element p-4 active:opacity-80">
                {project.icon_url ? (
                  <Image
                    source={{ uri: String(project.icon_url) }}
                    className="h-12 w-12 rounded-xl bg-muted"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
                    <HText size="sm" weight="bold" color="white">
                      {getProjectInitials(project.name)}
                    </HText>
                  </View>
                )}

                <View className="flex-1 min-w-0 gap-1">
                  <HText
                    size="base"
                    weight="semibold"
                    color="foreground"
                    numberOfLines={1}
                  >
                    {project.name}
                  </HText>
                  {!!project.description && (
                    <HText
                      size="sm"
                      color="muted"
                      numberOfLines={2}
                    >
                      {String(project.description)}
                    </HText>
                  )}
                </View>
              </Pressable>
            </Link>
          ))
        )}
      </ScrollView>
    </>
  );
}