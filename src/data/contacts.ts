/** Mock contacts – replace with API/contacts store when ready */

export type Contact = {
	id: string;
	name: string;
	avatar?: string;
};

export const MOCK_CONTACTS: Contact[] = [
	{ id: "2", name: "Alex Morgan", avatar: "https://i.pravatar.cc/120?u=2" },
	{ id: "3", name: "Jordan Lee", avatar: "https://i.pravatar.cc/120?u=3" },
	{ id: "4", name: "Sam Taylor" },
	{ id: "5", name: "Casey Kim", avatar: "https://i.pravatar.cc/120?u=5" },
	{ id: "6", name: "Riley Jones" },
];

export function getContactById(id: string): Contact | undefined {
	return MOCK_CONTACTS.find((c) => c.id === id);
}
