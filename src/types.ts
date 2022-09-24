import { TFile, View } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };

export interface SearchDOM {
    getFiles(): TFile[];
}

export interface SearchView extends View {
    dom: SearchDOM;
}

export interface ImprovedRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
    excludedFolders: string;
    selectedTag: string;
}
