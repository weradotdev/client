/**
 * API resource types aligned with backend API docs (document.json).
 * Add [key: string]: unknown if you need to allow extra API fields.
 */
interface UserResource {
	id: number;
	first_name: string;
	last_name: string;
	name: string;
	email: string;
	phone: string;
	type: string;
	gender: string;
	dob: string;
	avatar: string;
	avatar_url: string;
	email_verified_at?: string | null;
	created_at?: string;
	updated_at?: string;
	workspaces?: unknown[];
	projects?: unknown[];
	assigned_tasks?: unknown[];
	workspace_users?: unknown[];
	project_users?: unknown[];
	task_users?: unknown[];
}

interface StatsData {
	total_tasks: number;
	completed_tasks: number;
	in_progress_tasks: number;
	overdue_tasks: number;
	active_projects: number;
	completion_rate: number;
	team_members?: number;
}

/** Alias for components that expect User */
type User = UserResource;

/** Auth login/register response from POST /auth/login, POST /auth/register */
interface AuthTokenResponse {
	user: UserResource;
	token: string;
}

interface Workspace {
	id?: number | string;
	name: string;
	description?: string;
	[key: string]: unknown;
}

interface Project {
	id?: number | string;
	workspace_id?: string | number;
	name: string;
	description?: string;
	icon: string;
	icon_url: string;
	image: string;
	image_url: string;
	color: string;
	created_at: string;
	updated_at: string;
	last_comment: {
		body: string;
	};
	users: User[];
	comments: Comment[];
}

interface Board {
	id?: number | string;
	project_id?: string | number;
	name: string;
	description?: string;
	[key: string]: unknown;
}

interface Task {
	id?: number | string;
	project_id?: string | number;
	board_id?: string | number;
	title: string;
	description?: string;
	status?: string;
	priority?: string;
	due_date?: string;
	assigned_users?: UserResource[];
	checklist: string[];
	completed: string[];
	progress: number;
	board?: Board;
	project: Project;
	created_at?: string;
	updated_at?: string;
	due_at?: string;
	start_at?: string;
	end_at?: string;
	comments: Coment[];
	users: User[];
	[key: string]: unknown;
}

interface Comment {
	id: string;
	task_id: string | number;
	user_id: string | number;
	body: string;
	created_at: string;
	updated_at: string;
	timeAgo?: string;
	author?: UserResource;
}

interface DatabaseNotification {
	id: string;
	notifiable_type: string;
	notifiable_id: string | number;
	data: {
		title: string;
		body: any;
		[key: string]: unknown;
	};
	read_at: string | null;
	created_at: string;
	updated_at: string;
}

interface Plan {
	id?: number | string;
	name?: string;
	[key: string]: unknown;
}

type ResourceModelMap = {
	workspaces: Workspace;
	notifications: DatabaseNotification;
	projects: Project;
	boards: Board;
	tasks: Task;
	plans: Plan;
	auth: Record<string, unknown>;
};
