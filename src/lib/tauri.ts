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

export async function deleteCover(projectPath: string): Promise<void> {
  return invoke('delete_cover', { projectPath });
}

export async function deleteProject(projectPath: string): Promise<void> {
  return invoke('delete_project', { projectPath });
}

export async function renameProject(projectPath: string, newName: string): Promise<string> {
  return invoke('rename_project', { projectPath, newName });
}

// —— AI ——

export interface AiConfig {
  enabled: boolean;
  provider: string;
  base_url: string;
  api_key: string;
  model: string;
  verified: string[];
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function getAiConfig(vaultPath: string): Promise<AiConfig> {
  return invoke('get_ai_config', { vaultPath });
}

export async function saveAiConfig(vaultPath: string, config: AiConfig): Promise<void> {
  return invoke('save_ai_config', { vaultPath, config });
}

export async function aiChat(vaultPath: string, request: ChatRequest): Promise<string> {
  return invoke('ai_chat', { vaultPath, request });
}

// —— 构思 / 人设 ——

export type CharacterRole = 'protagonist' | 'supporting' | 'antagonist' | 'minor';
export type ConflictStatus = 'seed' | 'used' | 'archived';

export interface CharacterField {
  id: string;
  label: string;
  value: string;
  kind: 'short' | 'long';
}

export interface CharacterCard {
  id: string;
  name: string;
  aliases: string[];
  role: CharacterRole;
  color: string;
  importance: number;
  fields: CharacterField[];
  chapterIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelationship {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  surface: string;
  truth: string;
  tension: string;
  power: string;
  emotion: string;
  stage: string;
  notes: string;
  updatedAt: string;
}

export interface ConflictSeed {
  id: string;
  title: string;
  characterIds: string[];
  relationshipIds: string[];
  premise: string;
  pressure: string;
  possibleTurn: string;
  reverseQuestion: string;
  status: ConflictStatus;
  updatedAt: string;
}

export interface CharacterBoard {
  version: 1;
  updatedAt: string;
  characters: CharacterCard[];
  relationships: CharacterRelationship[];
  conflicts: ConflictSeed[];
}

export async function readCharacterBoard(projectPath: string): Promise<CharacterBoard> {
  const raw = await invoke<string>('read_character_board', { projectPath });
  const parsed = JSON.parse(raw) as CharacterBoard;
  return {
    version: 1,
    updatedAt: parsed.updatedAt || '',
    characters: parsed.characters || [],
    relationships: parsed.relationships || [],
    conflicts: parsed.conflicts || [],
  };
}

export async function saveCharacterBoard(projectPath: string, board: CharacterBoard): Promise<void> {
  return invoke('save_character_board', {
    projectPath,
    content: JSON.stringify(board, null, 2),
  });
}
