import { TFile } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };



export interface ImprovedRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
    excludedFolders: string;
    selectedTag: string;
}
