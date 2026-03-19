import { create } from "zustand";

export type ProjectsState = {
	projects: Project[];
	project: Project | null;
	setProject: (project: Project | null) => void;
	getProjectById: (id: string) => Project | undefined;
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
	projects: [],

	project: null,
	setProject: project => set({ project }),

	getProjectById: (id: string): Project | undefined => {
		return get().projects.find((t: Project) => t.id === id);
	},
}));
