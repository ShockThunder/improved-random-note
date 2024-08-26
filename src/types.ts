import { TFile } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };



export interface ImprovedRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
    excludedFolders: string;
    includedFolders: string;
    selectedTag: string;
}
