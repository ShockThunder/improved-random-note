import {  Plugin, TFile } from 'obsidian';
import { getTagFilesMap, randomElement } from './utilities';
import { ImprovedRandomNoteSettingTab } from './settingTab';
import {  ImprovedRandomNoteSettings } from './types';
import { ImprovedRandomNoteNotice } from './imporvedRandomNoteNotice';

export default class ImprovedRandomNotePlugin extends Plugin {
    settings: ImprovedRandomNoteSettings = { openInNewLeaf: true, enableRibbonIcon: true, excludedFolders: '', includedFolders: '', tagFilters: [] };
    ribbonIconEl: HTMLElement | undefined = undefined;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addSettingTab(new ImprovedRandomNoteSettingTab(this));

        this.addCommand({
            id: 'open-random-note',
            name: 'Open improved random note',
            callback: this.handleOpenRandomNote,
        });

        // Inject pill styles
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .tag-filter-pills {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            .tag-filter-pill {
                display: inline-flex;
                align-items: center;
                border-radius: 16px;
                padding: 2px 4px 2px 4px;
                font-size: 13px;
                border: 1px solid var(--background-modifier-border);
                background: var(--background-secondary);
            }
            .tag-pill-mode {
                cursor: pointer;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                user-select: none;
            }
            .tag-pill-include .tag-pill-mode {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
            }
            .tag-pill-exclude .tag-pill-mode {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }
            .tag-pill-label {
                padding: 0 6px;
                color: var(--text-normal);
            }
            .tag-pill-remove {
                cursor: pointer;
                padding: 0 6px;
                color: var(--text-muted);
                font-size: 16px;
                line-height: 1;
            }
            .tag-pill-remove:hover {
                color: var(--text-normal);
            }
        `;
        document.head.appendChild(styleEl);
        this.register(() => styleEl.remove());
    }

    onunload = (): void => {
    };

    handleOpenRandomNote = async (): Promise<void> => {
        await this.openRandomNote(this.app.vault.getMarkdownFiles());
    };

	openRandomNote = async (files: TFile[]): Promise<void> => {
	    const markdownFiles = files.filter((file) => file.extension === 'md');

		const filteredByExcludedFolders = this.filterExcludedFolders(markdownFiles);
		const filteredByIncludedFolders = this.filterIncludedFolders(filteredByExcludedFolders);
	    const filteredByTags = this.applyTagFilters(filteredByIncludedFolders);

	    if (!filteredByTags.length) {
	        new ImprovedRandomNoteNotice("Can't open note. No markdown files available to open.", 5000);
	        return;
	    }

	    const fileToOpen = randomElement(filteredByTags);
	    await this.app.workspace.openLinkText(fileToOpen.basename, '', this.settings.openInNewLeaf, {
	        active: true,
	    });
	};

	applyTagFilters(files: TFile[]) {
	    const filters = this.settings.tagFilters;
	    if (!filters || !filters.length) {
	        return files;
	    }

	    const includeTags = filters.filter(f => f.mode === 'include').map(f => f.tag);
	    const excludeTags = filters.filter(f => f.mode === 'exclude').map(f => f.tag);

	    if (!includeTags.length && !excludeTags.length) {
	        return files;
	    }

	    const tagFilesMap = getTagFilesMap(this.app);
	    let result = files;

	    // Exclude: remove files that have ANY excluded tag
	    if (excludeTags.length) {
	        let filesToExclude = new Set<string>();
	        for (const tag of excludeTags) {
	            const taggedFiles = tagFilesMap[tag];
	            if (taggedFiles) {
	                taggedFiles.forEach(file => filesToExclude.add(file.path));
	            }
	        }
	        result = result.filter(file => !filesToExclude.has(file.path));
	    }

	    // Include: keep only files that have ALL included tags
	    if (includeTags.length) {
	        result = result.filter(file => {
	            return includeTags.every(tag => {
	                const taggedFiles = tagFilesMap[tag];
	                return taggedFiles && taggedFiles.some(f => f.path === file.path);
	            });
	        });
	    }

	    return result;
	}

    filterExcludedFolders(files: TFile[]) {
		const excludedFolders = this.settings.excludedFolders.split(',').map(x => x.trim()).filter(x => x !== '');
		if (excludedFolders.length > 0) {
			return files.filter(x => excludedFolders.every(folder => !x.path.contains(folder)));
		}
		return files;
	}

	filterIncludedFolders(files: TFile[]) {
		const includedFolders = this.settings.includedFolders.split(',').map(x => x.trim()).filter(x => x !== '');
		if (includedFolders.length > 0) {
			return files.filter(x => includedFolders.some(folder => x.path.contains(folder)));
		}
		return files;
	}

    loadSettings = async (): Promise<void> => {
        const loadedSettings = (await this.loadData()) as any;
        if (loadedSettings) {
            this.setOpenInNewLeaf(loadedSettings.openInNewLeaf);
            this.setEnableRibbonIcon(loadedSettings.enableRibbonIcon);
            this.settings.excludedFolders = loadedSettings.excludedFolders || '';
            this.settings.includedFolders = loadedSettings.includedFolders || '';
            // Migrate old settings to tagFilters
            if (loadedSettings.tagFilters) {
                this.settings.tagFilters = loadedSettings.tagFilters;
            } else {
                this.settings.tagFilters = [];
                if (loadedSettings.selectedTag && loadedSettings.selectedTag.trim()) {
                    let tag = loadedSettings.selectedTag.trim();
                    if (!tag.startsWith('#')) tag = '#' + tag;
                    this.settings.tagFilters.push({ tag: tag, mode: 'include' });
                }
                if (loadedSettings.excludedTags && loadedSettings.excludedTags.length) {
                    for (let t of loadedSettings.excludedTags) {
                        t = t.trim();
                        if (t) {
                            if (!t.startsWith('#')) t = '#' + t;
                            this.settings.tagFilters.push({ tag: t, mode: 'exclude' });
                        }
                    }
                }
            }
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
