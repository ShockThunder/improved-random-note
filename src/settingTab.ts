import ImprovedRandomNotePlugin from './main';
import { PluginSettingTab, Setting } from 'obsidian';
import {FolderSuggest} from "./file-suggest";

export class ImprovedRandomNoteSettingTab extends PluginSettingTab {
    plugin: ImprovedRandomNotePlugin;

    constructor(plugin: ImprovedRandomNotePlugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Open in New Leaf')
            .setDesc('Default setting for opening random notes')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.openInNewLeaf);
                toggle.onChange(this.plugin.setOpenInNewLeaf);
            });

        new Setting(containerEl)
            .setName("Select folders to exclude")
            .setDesc("Folders splits by comma ','")
            .addText(cb => {
                new FolderSuggest(this.app, cb.inputEl);
                if(!this.plugin.settings.excludedFolders)
                    cb.setPlaceholder('Directory1, Directory2');
                cb                        
                    .setValue(this.plugin.settings.excludedFolders)
                    .onChange(async (value) => {
                        this.plugin.settings.excludedFolders = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Select folders to include")
            .setDesc("Folders splits by comma ','")
            .addText(cb => {
                new FolderSuggest(this.app, cb.inputEl);
                if(!this.plugin.settings.includedFolders)
                    cb.setPlaceholder('Directory1, Directory2');
                cb
                    .setValue(this.plugin.settings.includedFolders)
                    .onChange(async (value) => {
                        this.plugin.settings.includedFolders = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Filter by tag')
            .setDesc('Enter one tag to filter')
            .addText((text) => {
                if(!this.plugin.settings.selectedTag)
                    text.setPlaceholder('#tag');
                text
                .setValue(this.plugin.settings.selectedTag)
                .onChange(async (value) => {
                    this.plugin.settings.selectedTag = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Exclude tags')
            .setDesc('Enter tags to exclude, separated by comma')
            .addText((text) => {
                if(!this.plugin.settings.excludedTags?.length)
                    text.setPlaceholder('#tag1, #tag2');
                text
                .setValue(this.plugin.settings.excludedTags?.join(', ') || '')
                .onChange(async (value) => {
                    // Split the input string by comma and trim each tag
                    this.plugin.settings.excludedTags = value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0); // Remove empty tags
                    await this.plugin.saveSettings();
                });
            });
    }
}
