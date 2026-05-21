import { browser } from '$app/environment';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { sanitizeTiptapHtml } from '$lib/features/editor/content';
import { normalizeTaskTag, type DeckSnapshot, type Project, type Task } from './types';

const DB_NAME = 'mission-deck';
const DB_VERSION = 1;

interface MissionDeckDB extends DBSchema {
	projects: {
		key: string;
		value: Project;
		indexes: { 'by-order': number };
	};
	tasks: {
		key: string;
		value: Task;
		indexes: { 'by-project': string; 'by-project-order': [string, number] };
	};
	meta: {
		key: string;
		value: { key: string; value: unknown };
	};
}

let dbPromise: Promise<IDBPDatabase<MissionDeckDB>> | undefined;

type PersistedTask = Omit<Task, 'tag'> & { group?: unknown; tag?: unknown };

function normalizePersistedTask(task: PersistedTask): Task {
	const rawTag = 'tag' in task ? task.tag : task.group;
	const tag = normalizeTaskTag(rawTag) ?? null;
	return {
		id: task.id,
		projectId: task.projectId,
		content: sanitizeTiptapHtml(task.content),
		tag,
		completed: task.completed,
		archived: task.archived,
		focused: task.focused,
		order: task.order,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
		completedAt: task.completedAt
	};
}

function getDb() {
	if (!browser) throw new Error('IndexedDB is only available in the browser.');

	dbPromise ??= openDB<MissionDeckDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains('projects')) {
				const projects = db.createObjectStore('projects', { keyPath: 'id' });
				projects.createIndex('by-order', 'order');
			}

			if (!db.objectStoreNames.contains('tasks')) {
				const tasks = db.createObjectStore('tasks', { keyPath: 'id' });
				tasks.createIndex('by-project', 'projectId');
				tasks.createIndex('by-project-order', ['projectId', 'order']);
			}

			if (!db.objectStoreNames.contains('meta')) {
				db.createObjectStore('meta', { keyPath: 'key' });
			}
		}
	});

	return dbPromise;
}

export async function loadDeck(): Promise<DeckSnapshot> {
	const db = await getDb();
	const [projects, tasks] = await Promise.all([db.getAll('projects'), db.getAll('tasks')]);

	return {
		version: 1,
		projects: projects.sort((a, b) => a.order - b.order),
		tasks: tasks.map(normalizePersistedTask).sort((a, b) => a.order - b.order)
	};
}

export async function saveProject(project: Project) {
	const db = await getDb();
	await db.put('projects', project);
}

export async function saveTask(task: Task) {
	const db = await getDb();
	await db.put('tasks', task);
}

export async function deleteTask(taskId: string) {
	const db = await getDb();
	await db.delete('tasks', taskId);
}

export async function replaceDeck(snapshot: DeckSnapshot) {
	const db = await getDb();
	const tx = db.transaction(['projects', 'tasks', 'meta'], 'readwrite');

	await Promise.all([tx.objectStore('projects').clear(), tx.objectStore('tasks').clear()]);

	for (const project of snapshot.projects) {
		await tx.objectStore('projects').put(project);
	}

	for (const task of snapshot.tasks) {
		await tx.objectStore('tasks').put(task);
	}

	await tx.objectStore('meta').put({ key: 'version', value: snapshot.version });
	await tx.done;
}
