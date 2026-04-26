import { invoke } from '@tauri-apps/api/core';

export interface ProjectMeta {
  name: string;
  directory: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  file_path: string;
  word_count: number;
  status: 'Draft' | 'Done' | 'Revising';
  order: number;
  volume: string;
}

export async function createProject(name: string, directory: string): Promise<ProjectMeta> {
  return invoke('create_project', { name, directory });
}

export async function openProject(path: string): Promise<ProjectMeta> {
  return invoke('open_project', { path });
}

export async function listChapters(projectPath: string): Promise<Chapter[]> {
  return invoke('list_chapters', { projectPath });
}

export async function readChapter(filePath: string): Promise<string> {
  return invoke('read_chapter', { filePath });
}

export async function writeChapter(filePath: string, content: string): Promise<void> {
  return invoke('write_chapter', { filePath, content });
}

export async function createChapter(projectPath: string, fileName: string, title: string): Promise<string> {
  return invoke('create_chapter', { projectPath, fileName, title });
}

export async function deleteChapter(filePath: string, projectPath: string): Promise<void> {
  return invoke('delete_chapter', { filePath, projectPath });
}

export async function renameChapter(filePath: string, projectPath: string, newTitle: string): Promise<void> {
  return invoke('rename_chapter', { filePath, projectPath, newTitle });
}

export async function scanVault(vaultPath: string): Promise<ProjectMeta[]> {
  return invoke('scan_vault', { vaultPath });
}

export async function readCover(projectPath: string): Promise<string | null> {
  return invoke('read_cover', { projectPath });
}

export async function setCover(projectPath: string, sourcePath: string): Promise<void> {
  return invoke('set_cover', { projectPath, sourcePath });
}

export async function deleteProject(projectPath: string): Promise<void> {
  return invoke('delete_project', { projectPath });
}

export async function renameProject(projectPath: string, newName: string): Promise<string> {
  return invoke('rename_project', { projectPath, newName });
}
