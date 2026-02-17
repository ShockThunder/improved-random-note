import { TFile } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };

export interface TagFilter {
    tag: string;
    mode: 'include' | 'exclude';
}

export interface ImprovedRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
    excludedFolders: string;
    includedFolders: string;
    tagFilters: TagFilter[];
}
