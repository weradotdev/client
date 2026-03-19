import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
	id: "auth-storage",
});

export const useAuthStore = create<{
	token: string | null;
	user: User | null;
	authenticated: boolean;
	verified: boolean;
	onboarded: boolean;
	language: string;
	searchQuery?: string;
	currentProject: Project | null;
	currentWorkspace: Workspace | null;
	baseUrl: string;
	setBaseUrl: (baseUrl: string) => void;
	setCurrentProject: (project: Project | null) => void;
	setCurrentWorkspace: (workspace: Workspace | null) => void;
	setToken: (token: string | null) => void;
	setUser: (user: User) => void;
	setAuthenticated: (authenticated: boolean) => void;
	setVerified: (verified: boolean) => void;
	setOnboarded: (onboarded: boolean) => void;
	setLanguage: (language: string) => void;
	setSearchQuery: (query: string) => void;
	logout: () => Promise<unknown>;
}>()(
	persist(
		set => ({
			token: null,
			user: null,
			authenticated: false,
			verified: false,
			onboarded: false,
			language: "en",
			searchQuery: "",
			currentProject: null,
			currentWorkspace: null,
			baseUrl: "https://api.wera.dev",
			setBaseUrl: baseUrl => set({ baseUrl }),
			setCurrentProject: project => set({ currentProject: project }),
			setCurrentWorkspace: workspace =>
				set({ currentWorkspace: workspace }),
			setSearchQuery: query => set({ searchQuery: query }),
			setToken: token => set({ token }),
			setUser: user =>
				set(state => ({
					user: { ...state.user, ...user },
					authenticated: true,
				})),
			setAuthenticated: authenticated => set({ authenticated }),
			setVerified: verified => set({ verified }),
			setOnboarded: onboarded => set({ onboarded }),
			setLanguage: language => set({ language }),
			logout: async () => {
				set({
					token: null,
					user: null,
					authenticated: false,
					onboarded: true,
				});
			},
		}),
		{
			name: "auth",
			storage: createJSONStorage(() => ({
				getItem: name => storage.getString(name) ?? null,
				setItem: (name, value) => storage.set(name, value),
				removeItem: name => storage.remove(name),
			})),
			partialize: state => ({
				token: state.token,
				user: state.user,
				currentProject: state.currentProject,
				authenticated: state.authenticated,
			}),
		},
	),
);
