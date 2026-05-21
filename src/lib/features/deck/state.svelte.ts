import { browser } from '$app/environment';
import { deleteTask, loadDeck, replaceDeck, saveProject, saveTask } from './db';
import type { DeckSnapshot, Project, Task, TaskGroup } from './types';

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

function sampleDeck(): DeckSnapshot {
	const createdAt = now();
	const projects: Project[] = [
		{
			id: createId('project'),
			name: 'Mission Deck',
			order: ORDER_STEP,
			archived: false,
			completedExpanded: false,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('project'),
			name: 'Personal Ops',
			order: ORDER_STEP * 2,
			archived: false,
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
			group: 'hands-on',
			completed: false,
			archived: false,
			focused: true,
			order: ORDER_STEP,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('task'),
			projectId: projects[0].id,
			content: 'Keep the task model intentionally small',
			group: 'concern',
			completed: false,
			archived: false,
			focused: false,
			order: ORDER_STEP,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: createId('task'),
			projectId: projects[1].id,
			content: 'Collect loose errands without making them heavy',
			group: 'other',
			completed: false,
			archived: false,
			focused: false,
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
		return this.projects.filter((project) => !project.archived).sort((a, b) => a.order - b.order);
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
			archived: false,
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
		await Promise.all(updated.map((p) => saveProject(projectSnapshot(p))));
	}

	async archiveProject(projectId: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		project.archived = true;
		project.updatedAt = now();
		await saveProject(projectSnapshot(project));
	}

	async toggleCompletedExpanded(projectId: string) {
		const project = this.projects.find((item) => item.id === projectId);
		if (!project) return;

		project.completedExpanded = !project.completedExpanded;
		project.updatedAt = now();
		await saveProject(projectSnapshot(project));
	}

	async addTask(projectId: string, group: TaskGroup, content = '') {
		const initialContent = content;
		const timestamp = now();
		const siblings = this.tasks.filter((task) => task.projectId === projectId && !task.archived);
		const task: Task = {
			id: createId('task'),
			projectId,
			content: initialContent,
			group,
			completed: false,
			archived: false,
			focused: false,
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

	async setTaskGroup(taskId: string, group: TaskGroup) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task || task.group === group) return;

		task.group = group;
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

	async toggleTaskFocus(taskId: string) {
		const task = this.tasks.find((item) => item.id === taskId);
		if (!task) return;

		task.focused = !task.focused;
		task.updatedAt = now();
		await saveTask(taskSnapshot(task));
	}

	async deleteTask(taskId: string) {
		this.tasks = this.tasks.filter((task) => task.id !== taskId);
		await deleteTask(taskId);
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
