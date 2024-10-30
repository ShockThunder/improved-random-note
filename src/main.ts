import {  Plugin, TFile } from 'obsidian';
import { getTagFilesMap, randomElement } from './utilities';
import { ImprovedRandomNoteSettingTab } from './settingTab';
import {  ImprovedRandomNoteSettings } from './types';
import { ImprovedRandomNoteNotice } from './imporvedRandomNoteNotice';

export default class ImprovedRandomNotePlugin extends Plugin {
    settings: ImprovedRandomNoteSettings = { openInNewLeaf: true, enableRibbonIcon: true, selectedTag: '', excludedFolders: '', includedFolders: '', excludedTags: [] };
    ribbonIconEl: HTMLElement | undefined = undefined;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addSettingTab(new ImprovedRandomNoteSettingTab(this));

        this.addCommand({
            id: 'open-random-note',
            name: 'Open improved random note',
            callback: this.handleOpenRandomNote,
        });

    }

    onunload = (): void => {
    };

    handleOpenRandomNote = async (): Promise<void> => {
        const excludedFolders = this.settings.excludedFolders.split(',').map(x => x.trim()).filter(x => x !== '');
        const includedFolders = this.settings.includedFolders.split(',').map(x => x.trim()).filter(x => x !== '');
        
        let markdownFiles;
        if (includedFolders.length > 0){
            markdownFiles = this.app.vault.getMarkdownFiles().filter(x => includedFolders.some(folder => x.path.contains(folder)));
        } 
        else {
            markdownFiles = this.app.vault.getMarkdownFiles().filter(x => excludedFolders.every(folder => !x.path.contains(folder)));
        }
        await this.openRandomNote(markdownFiles);
    };

	openRandomNote = async (files: TFile[]): Promise<void> => {
	    const markdownFiles = files.filter((file) => file.extension === 'md');
	
	    const filteredFolders = this.filterExcludedFolders(markdownFiles);
	    const filteredByExcludedTags = this.excludeTags(filteredFolders);
	    const filteredBySelectedTag = this.filterTag(filteredByExcludedTags);
	
	    if (!filteredBySelectedTag.length) {
	        new ImprovedRandomNoteNotice("Can't open note. No markdown files available to open.", 5000);
	        return;
	    }
	
	    const fileToOpen = randomElement(filteredBySelectedTag);
	    await this.app.workspace.openLinkText(fileToOpen.basename, '', this.settings.openInNewLeaf, {
	        active: true,
	    });
	};
	
	excludeTags(files: TFile[]) {
	    if (!this.settings.excludedTags?.length) {
	        return files;
	    }
	
	    const tagFilesMap = getTagFilesMap(this.app);
	    let filesToExclude = new Set<string>();
	
	    // Collect all files that have any of the excluded tags
	    for (let tag of this.settings.excludedTags) {
	        if (!tag.startsWith('#')) {
	            tag = '#' + tag;
	        }
	        
	        const taggedFiles = tagFilesMap[tag];
	        if (taggedFiles) {
	            taggedFiles.forEach(file => filesToExclude.add(file.path));
	        }
	    }
	
	    // Return files that don't have any excluded tags
	    return files.filter(file => !filesToExclude.has(file.path));
	}


    filterExcludedFolders(files: TFile[]) {
        const excludedFolders = this.settings.excludedFolders.split(',').map(x => x.trim()).filter(x => x !== '');
        return files.filter(x => excludedFolders.every(folder => !x.path.contains(folder)));
    }

    filterTag(files: TFile[]) {
        let tag = this.settings.selectedTag;
        if(tag == '')
            return files;

        if (!tag.startsWith('#')){
            tag = '#' + tag;
        }
        
        const tagFilesMap = getTagFilesMap(this.app);
        let taggedFiles = tagFilesMap[tag];
        if (!taggedFiles){
            taggedFiles = [];
        }
        const result = files.filter(x => taggedFiles.some(f => f.path == x.path));
        return result;
    }

    loadSettings = async (): Promise<void> => {
        const loadedSettings = (await this.loadData()) as ImprovedRandomNoteSettings;
        if (loadedSettings) {
            this.setOpenInNewLeaf(loadedSettings.openInNewLeaf);
            this.setEnableRibbonIcon(loadedSettings.enableRibbonIcon);
            this.settings.excludedFolders = loadedSettings.excludedFolders;
            this.settings.selectedTag = loadedSettings.selectedTag;
            this.settings.excludedTags = loadedSettings.excludedTags;
        } else {
            this.refreshRibbonIcon();
        }
        this.saveSettings()
    };

    setOpenInNewLeaf = (value: boolean): void => {
        this.settings.openInNewLeaf = value;
        this.saveData(this.settings);
    };

    setEnableRibbonIcon = (value: boolean): void => {
        this.settings.enableRibbonIcon = value;
        this.refreshRibbonIcon();
        this.saveData(this.settings);
    };

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshRibbonIcon = (): void => {
        this.ribbonIconEl?.remove();
        if (this.settings.enableRibbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(
                'dice',
                'Open improved random note',
                this.handleOpenRandomNote,
            );
        }
    };
}
