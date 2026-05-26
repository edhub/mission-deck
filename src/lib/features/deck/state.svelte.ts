import { browser } from '$app/environment';
import { sanitizeTiptapHtml } from '$lib/features/editor/content';
import { deleteProject, deleteTask, loadDeck, replaceDeck, saveProject, saveTask } from './db';
import {
	normalizeTaskTag,
	type DeckSnapshot,
	type Project,
	type Task,
	type TaskTag
} from './types';

const ORDER_STEP = 1024;

function now() {
	return new Date().toISOString();
}

function createId(prefix: string) {
	return `${prefix}_${crypto.randomUUID()}`;
}

function nextOrder(items: { order: number }[]) {
	return Math.max(0, ...items.map((item) => item.order)) + ORDER_STEP;
}

function projectSnapshot(project: Project): Project {
	return $state.snapshot(project) as Project;
}

function taskSnapshot(task: Task): Task {
	return $state.snapshot(task) as Task;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function requireString(value: Record<string, unknown>, key: string) {
	const field = value[key];
	if (!isString(field)) throw new Error(`Invalid import: ${key} must be a string.`);
	return field;
}

function requireBoolean(value: Record<string, unknown>, key: string) {
	const field = value[key];
	if (!isBoolean(field)) throw new Error(`Invalid import: ${key} must be a boolean.`);
	return field;
}

function requireNumber(value: Record<string, unknown>, key: string) {
	const field = value[key];
	if (!isNumber(field)) throw new Error(`Invalid import: ${key} must be a number.`);
	return field;
}

function parseDeckSnapshot(value: unknown): DeckSnapshot {
	if (!isRecord(value)) throw new Error('Invalid import: deck file must be a JSON object.');
	if (value.version !== 1) {
		throw new Error(`Invalid import: unsupported deck version ${JSON.stringify(value.version)}.`);
	}
	if (!Array.isArray(value.projects) || !Array.isArray(value.tasks)) {
		throw new Error('Invalid import: projects and tasks are required.');
	}

	const projects: Project[] = value.projects.map((item) => {
		if (!isRecord(item)) throw new Error('Invalid import: project must be an object.');
		const completedAt = item.completedAt;
		if (completedAt !== undefined && !isString(completedAt)) {
			throw new Error('Invalid import: project completedAt must be a string.');
		}

		return {
			id: requireString(item, 'id'),
			name: sanitizeTiptapHtml(requireString(item, 'name')),
			order: requireNumber(item, 'order'),
			completed: 'completed' in item ? requireBoolean(item, 'completed') : false,
			completedExpanded: requireBoolean(item, 'completedExpanded'),
			createdAt: requireString(item, 'createdAt'),
			updatedAt: requireString(item, 'updatedAt'),
			completedAt
		};
	});

	const projectIds: string[] = [];
	for (const project of projects) {
		if (projectIds.includes(project.id))
			throw new Error(`Invalid import: duplicate project id ${project.id}.`);
		projectIds.push(project.id);
	}

	const taskIds: string[] = [];
	const tasks: Task[] = value.tasks.map((item) => {
		if (!isRecord(item)) throw new Error('Invalid import: task must be an object.');
		const rawTag = 'tag' in item ? item.tag : item.group;
		const tag = normalizeTaskTag(rawTag);
		if (tag === undefined) throw new Error('Invalid import: task tag is invalid.');

		const projectId = requireString(item, 'projectId');
		if (!projectIds.includes(projectId))
			throw new Error('Invalid import: task points to a missing project.');

		const id = requireString(item, 'id');
		if (taskIds.includes(id)) throw new Error(`Invalid import: duplicate task id ${id}.`);
		taskIds.push(id);

		const completedAt = item.completedAt;
		if (completedAt !== undefined && !isString(completedAt)) {
			throw new Error('Invalid import: completedAt must be a string.');
		}

		const flagged =
			'flagged' in item ? requireBoolean(item, 'flagged') : requireBoolean(item, 'focused');

		return {
			id,
			projectId,
			content: sanitizeTiptapHtml(requireString(item, 'content')),
			tag,
			completed: requireBoolean(item, 'completed'),
			archived: requireBoolean(item, 'archived'),
			flagged,
			order: requireNumber(item, 'order'),
			createdAt: requireString(item, 'createdAt'),
			updatedAt: requireString(item, 'updatedAt'),
			completedAt
		};
	});

	return {
		version: 1,
		projects: projects.sort((a, b) => a.order - b.order),
		tasks: tasks.sort((a, b) => a.order - b.order)
	};
}

function sampleDeck(): DeckSnapshot {
	const createdAt = now();
	const projects: Project[] = [
		{
			id: createId('project'),
			name: 'Mission Deck',
			order: ORDER_STEP,
			completed: false,
			completedExpanded: false,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('project'),
			name: 'Personal Ops',
			order: ORDER_STEP * 2,
			completed: false,
			completedExpanded: false,
			createdAt,
			updatedAt: createdAt
		}
	];

	const tasks: Task[] = [
		{
			id: createId('task'),
			projectId: projects[0].id,
			content: 'Shape the first usable deck layout',
			tag: 'hands-on',
			completed: false,
			archived: false,
			flagged: true,
			order: ORDER_STEP,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('task'),
			projectId: projects[0].id,
			content: 'Keep the task model intentionally small',
			tag: 'concern',
			completed: false,
			archived: false,
			flagged: false,
			order: ORDER_STEP,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('task'),
			projectId: projects[1].id,
			content: 'Collect loose errands without making them heavy',
			tag: null,
			completed: false,
			archived: false,
			flagged: false,
			order: ORDER_STEP,
			createdAt,
			updatedAt: createdAt
		}
	];

	return { version: 1, projects, tasks };
}

class DeckState {
	projects = $state<Project[]>([]);
	tasks = $state<Task[]>([]);
	loaded = $state(false);

	get activeProjects() {
		return this.projects.filter((project) => !project.completed).sort((a, b) => a.order - b.order);
	}

	get completedProjects() {
		return this.projects
			.filter((project) => project.completed)
			.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
	}

	get hasCompletedTasks() {
		return this.tasks.some((task) => task.completed && !task.archived);
	}

	get snapshot(): DeckSnapshot {
		return {
			version: 1,
			projects: this.projects.map(projectSnapshot),
			tasks: this.tasks.map(taskSnapshot)
		};
	}

	async load() {
		if (!browser || this.loaded) return;

		const snapshot = await loadDeck();
		if (snapshot.projects.length === 0) {
			const seed = sampleDeck();
			this.projects = seed.projects;
			this.tasks = seed.tasks;
			await replaceDeck(seed);
		} else {
			this.projects = snapshot.projects;
			this.tasks = snapshot.tasks;
		}

		this.loaded = true;
	}

	tasksForProject(projectId: string) {
		return this.tasks
			.filter((task) => task.projectId === projectId)
			.sort((a, b) => a.order - b.order);
	}

	activeTasksForProject(projectId: string) {
		return this.tasksForProject(projectId).filter((task) => !task.archived);
	}

	archivedTasksForProject(projectId: string) {
		return this.tasksForProject(projectId)
			.filter((task) => task.archived)
			.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
	}

	async addProject() {
		const timestamp = now();
		const project: Project = {
			id: createId('project'),
			name: 'New Project',
			order: nextOrder(this.projects),
			completed: false,
			completedExpanded: false,
			createdAt: timestamp,
			updatedAt: timestamp
		};

		this.projects = [...this.projects, project];
		await saveProject(projectSnapshot(project));
	}

	async renameProject(projectId: string, name: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		project.name = name.trim() || 'Untitled Project';
		project.updatedAt = now();
		await saveProject(projectSnapshot(project));
	}

	async reorderProjects(orderedIds: string[]) {
		const timestamp = now();
		const updated: Project[] = [];
		for (let i = 0; i < orderedIds.length; i++) {
			const project = this.projects.find((p) => p.id === orderedIds[i]);
			if (!project) continue;
			const nextOrder = ORDER_STEP * (i + 1);
			if (project.order === nextOrder) continue;
			project.order = nextOrder;
			project.updatedAt = timestamp;
			updated.push(project);
		}
		try {
			await Promise.all(updated.map((p) => saveProject(projectSnapshot(p))));
		} catch (error) {
			console.error('Failed to persist project reorder', error);
		}
	}

	async moveTasks(projectId: string, orderedIds: string[]) {
		const timestamp = now();
		const updated: Task[] = [];
		for (let i = 0; i < orderedIds.length; i++) {
			const task = this.tasks.find((t) => t.id === orderedIds[i]);
			if (!task) continue;
			const nextOrder = ORDER_STEP * (i + 1);
			if (task.projectId === projectId && task.order === nextOrder) continue;
			task.projectId = projectId;
			task.order = nextOrder;
			task.updatedAt = timestamp;
			updated.push(task);
		}
		try {
			await Promise.all(updated.map((t) => saveTask(taskSnapshot(t))));
		} catch (error) {
			console.error('Failed to persist task move', error);
		}
	}

	async completeProject(projectId: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		const timestamp = now();
		project.completed = true;
		project.completedAt = timestamp;
		project.updatedAt = timestamp;
		await saveProject(projectSnapshot(project));
	}

	async reopenProject(projectId: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		project.completed = false;
		project.completedAt = undefined;
		project.updatedAt = now();
		await saveProject(projectSnapshot(project));
	}

	async deleteProject(projectId: string) {
		this.projects = this.projects.filter((project) => project.id !== projectId);
		this.tasks = this.tasks.filter((task) => task.projectId !== projectId);
		await deleteProject(projectId);
	}

	async toggleCompletedExpanded(projectId: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		project.completedExpanded = !project.completedExpanded;
		project.updatedAt = now();
		await saveProject(projectSnapshot(project));
	}

	async addTask(projectId: string, tag: TaskTag | null, content = '') {
		const initialContent = content;
		const timestamp = now();
		const siblings = this.tasks.filter((task) => task.projectId === projectId && !task.archived);
		const task: Task = {
			id: createId('task'),
			projectId,
			content: initialContent,
			tag,
			completed: false,
			archived: false,
			flagged: false,
			order: nextOrder(siblings),
			createdAt: timestamp,
			updatedAt: timestamp
		};

		this.tasks = [...this.tasks, task];
		await saveTask(taskSnapshot(task));
		return task.id;
	}

	async updateTaskContent(taskId: string, content: string) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task) return;

		task.content = content;
		task.updatedAt = now();
		await saveTask(taskSnapshot(task));
	}

	async setTaskTag(taskId: string, tag: TaskTag | null) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task || task.tag === tag) return;

		task.tag = tag;
		task.updatedAt = now();
		await saveTask(taskSnapshot(task));
	}

	async toggleTaskCompleted(taskId: string) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task) return;

		task.completed = !task.completed;
		task.completedAt = task.completed ? now() : undefined;
		if (!task.completed) task.archived = false;
		task.updatedAt = now();
		await saveTask(taskSnapshot(task));
	}

	async archiveAllCompletedTasks() {
		const timestamp = now();
		const tasks = this.tasks.filter((task) => task.completed && !task.archived);

		for (const task of tasks) {
			task.archived = true;
			task.updatedAt = timestamp;
		}

		await Promise.all(tasks.map((task) => saveTask(taskSnapshot(task))));
	}

	async toggleTaskFlag(taskId: string) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task) return;

		task.flagged = !task.flagged;
		task.updatedAt = now();
		await saveTask(taskSnapshot(task));
	}

	async deleteTask(taskId: string) {
		this.tasks = this.tasks.filter((task) => task.id !== taskId);
		await deleteTask(taskId);
	}

	async importDeck(value: unknown) {
		const snapshot = parseDeckSnapshot(value);
		await replaceDeck(snapshot);
		this.projects = snapshot.projects;
		this.tasks = snapshot.tasks;
	}

	async exportDeck() {
		const blob = new Blob([JSON.stringify(this.snapshot, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `mission-deck-${new Date().toISOString().slice(0, 10)}.json`;
		anchor.click();
		URL.revokeObjectURL(url);
	}
}

export const deck = new DeckState();
