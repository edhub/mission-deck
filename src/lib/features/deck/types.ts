export const TASK_GROUPS = ['concern', 'details', 'hands-on', 'delegate', 'other'] as const;

export type TaskGroup = (typeof TASK_GROUPS)[number];

export interface Project {
	id: string;
	name: string;
	order: number;
	archived: boolean;
	completedExpanded: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Task {
	id: string;
	projectId: string;
	content: string;
	group: TaskGroup;
	completed: boolean;
	archived: boolean;
	focused: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
}

export interface DeckSnapshot {
	version: 1;
	projects: Project[];
	tasks: Task[];
}

export const TASK_GROUP_LABELS: Record<TaskGroup, string> = {
	concern: 'Concern',
	details: 'Details',
	'hands-on': 'Hands-on',
	delegate: 'Delegate',
	other: 'Other'
};
