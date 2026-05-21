export const TASK_TAGS = ['concern', 'hands-on', 'details', 'verify'] as const;

export type TaskTag = (typeof TASK_TAGS)[number];

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
	tag: TaskTag | null;
	completed: boolean;
	archived: boolean;
	flagged: boolean;
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

export function normalizeTaskTag(value: unknown): TaskTag | null | undefined {
	if (value === null || value === 'none' || value === 'other') return null;
	if (typeof value === 'string' && TASK_TAGS.includes(value as TaskTag)) return value as TaskTag;
	if (value === 'delegate') return 'verify';
	return undefined;
}

export const TASK_TAG_LABELS: Record<TaskTag, string> = {
	concern: 'Concern',
	'hands-on': 'Hands-on',
	details: 'Details',
	verify: 'Verify'
};

export const TASK_TAG_ACCENTS: Record<TaskTag, string> = {
	concern: 'bg-warning/35',
	'hands-on': 'bg-success/30',
	details: 'bg-info/30',
	verify: 'bg-secondary/30'
};
