import { addDays, endOfWeek, format, isAfter, isBefore, parse, startOfDay, startOfWeek } from "date-fns";

import { create } from "zustand";

export type DueDateFilter = "today" | "this_week" | "overdue" | "custom" | null;

export type TaskFiltersState = {
	priority: string | null;
	dueAtFilter: DueDateFilter;
	customDateStart: string | null;
	customDateEnd: string | null;
	assignedMemberIds: string[];
	projectQuery: string;
	setPriority: (priority: string | null) => void;
	setDueDateFilter: (filter: DueDateFilter) => void;
	setCustomDateRange: (start: string | null, end: string | null) => void;
	toggleAssignedMember: (userId: string) => void;
	setAssignedMembers: (ids: string[]) => void;
	setProjectQuery: (query: string) => void;
	clearAll: () => void;
};

const initialState = {
	priority: null as string | null,
	dueAtFilter: null as DueDateFilter,
	customDateStart: null as string | null,
	customDateEnd: null as string | null,
	assignedMemberIds: [] as string[],
	projectQuery: "",
};

function parseDueDate(due_at: string): Date | null {
	try {
		return parse(due_at, "MMM d, yyyy", new Date());
	} catch {
		return null;
	}
}

export function filterTasks(tasks: Task[], filters: typeof initialState): Task[] {
	return tasks?.filter(task => {
		if (filters.priority != null && filters.priority !== "") {
			const taskPriority = (task.priority ?? "").toLowerCase();
			const filterPriority = filters.priority.toLowerCase();
			if (taskPriority !== filterPriority) return false;
		}

		if (filters.dueAtFilter != null || filters.customDateStart != null) {
			const taskDate = parseDueDate(task.due_at ?? "");
			if (!taskDate) return false;

			const today = startOfDay(new Date());

			if (filters.dueAtFilter === "today") {
				if (format(taskDate, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) return false;
			} else if (filters.dueAtFilter === "this_week") {
				const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
				if (isAfter(taskDate, weekEnd) || isBefore(taskDate, startOfWeek(today, { weekStartsOn: 1 }))) return false;
			} else if (filters.dueAtFilter === "overdue") {
				if (!isBefore(taskDate, today)) return false;
			} else if (
			filters.dueAtFilter === "custom" &&
			filters.customDateStart != null &&
			filters.customDateEnd != null
		) {
				const start = parse(filters.customDateStart, "yyyy-MM-dd", new Date());
				const end = addDays(parse(filters.customDateEnd, "yyyy-MM-dd", new Date()), 1);
				if (isBefore(taskDate, start) || isAfter(taskDate, end)) return false;
			}
		}

		if (filters.assignedMemberIds.length > 0) {
			const taskUserIds = new Set(task.assigned_users?.map(u => u.id));
			const hasAny = filters.assignedMemberIds.some(id => taskUserIds.has(Number(id)));
			if (!hasAny) return false;
		}

		if (filters.projectQuery.trim() !== "") {
			const query = filters.projectQuery.trim().toLowerCase();
			const taskProject = (task.project.name ?? "");
			const title = task.title.toLowerCase();
			if (!taskProject.includes(query) && !title.includes(query)) return false;
		}

		return true;
	});
}

export const useFiltersStore = create<TaskFiltersState>((set) => ({
	...initialState,

	setPriority: priority => set({ priority }),

	setDueDateFilter: dueAtFilter => set({ dueAtFilter }),

	setCustomDateRange: (customDateStart, customDateEnd) =>
		set({ customDateStart, customDateEnd }),

	toggleAssignedMember: userId =>
		set(state => ({
			assignedMemberIds: state.assignedMemberIds.includes(userId)
				? state.assignedMemberIds.filter(id => id !== userId)
				: [...state.assignedMemberIds, userId],
		})),

	setAssignedMembers: assignedMemberIds => set({ assignedMemberIds }),

	setProjectQuery: projectQuery => set({ projectQuery }),

	clearAll: () => set(initialState),
}));
