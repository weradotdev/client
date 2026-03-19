/** Mock project conversations for the Chat tab – replace with API when ready */

export type ProjectConversation = {
	projectId: string;
	projectName: string;
	/** Optional project logo URL – show fallback initial(s) when missing */
	logo?: string;
	lastMessage: string;
	lastAt: Date;
	memberCount: number;
};

export const MOCK_PROJECT_CONVERSATIONS: ProjectConversation[] = [
	{
		projectId: "proj-1",
		projectName: "Website redesign",
		logo: "https://api.dicebear.com/9.x/shapes/png?seed=website&backgroundColor=6B4E9E",
		lastMessage: "I'll push the design updates by EOD.",
		lastAt: new Date(Date.now() - 15 * 60 * 1000),
		memberCount: 4,
	},
	{
		projectId: "proj-2",
		projectName: "Mobile app",
		logo: "https://api.dicebear.com/9.x/shapes/png?seed=mobile&backgroundColor=4A90D9",
		lastMessage: "Sprint planning moved to Thursday.",
		lastAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
		memberCount: 6,
	},
	{
		projectId: "proj-3",
		projectName: "API v2",
		logo: "https://api.dicebear.com/9.x/shapes/png?seed=api&backgroundColor=2E7D32",
		lastMessage: "Docs are ready for review.",
		lastAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
		memberCount: 3,
	},
];

export function getProjectConversationByProjectId(projectId: string): ProjectConversation | undefined {
	return MOCK_PROJECT_CONVERSATIONS.find((c) => c.projectId === projectId);
}
