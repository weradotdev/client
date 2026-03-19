import { create } from "zustand";

export type TasksState = {
	tasks: Task[];
	task: Task | null;
	setTask: (task: Task | null) => void;
	getTaskById: (id: string) => Task | undefined;
	setTaskChecklistCompleted: (taskId: number, completed: string[]) => void;
};

export const useTasksStore = create<TasksState>((set, get) => ({
	tasks: [],

	task: null,
	setTask: task => set({ task }),

	getTaskById: (id: string): Task | undefined => {
		return get().tasks.find((t: Task) => t.id === id);
	},

	setTaskChecklistCompleted: (taskId, completed) =>
		set(state => {
			const task = state.tasks.find((t: Task) => t.id === taskId);
			if (!task || task.checklist.length === 0) return state;
			const progress = Math.round(
				(completed.filter(Boolean).length / task.checklist.length) *
					100,
			);
			return {
				tasks: state.tasks.map((t: Task) =>
					t.id === taskId
						? { ...t, checklistCompleted: completed, progress }
						: t,
				),
			};
		}),
}));
