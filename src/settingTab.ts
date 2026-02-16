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

        // Tag Filters section
        const tagFilterSetting = new Setting(containerEl)
            .setName('Tag filters')
            .setDesc('Add tags to include or exclude. Include = note must have ALL included tags. Exclude = note must not have any excluded tag.');

        tagFilterSetting.addText((text) => {
            text.setPlaceholder('#tag');
            text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = text.getValue().trim();
                    if (val) {
                        let tag = val.startsWith('#') ? val : '#' + val;
                        // Don't add duplicates
                        if (!this.plugin.settings.tagFilters.some(f => f.tag === tag)) {
                            this.plugin.settings.tagFilters.push({ tag: tag, mode: 'include' });
                            this.plugin.saveSettings();
                            text.setValue('');
                            this.renderPills(pillContainer);
                        }
                    }
                }
            });
        });

        const pillContainer = containerEl.createDiv('tag-filter-pills');
        this.renderPills(pillContainer);
    }

    renderPills(container: HTMLElement): void {
        container.empty();
        this.plugin.settings.tagFilters.forEach((filter, index) => {
            const pill = container.createDiv('tag-filter-pill');
            pill.addClass(filter.mode === 'include' ? 'tag-pill-include' : 'tag-pill-exclude');

            const modeBtn = pill.createSpan('tag-pill-mode');
            modeBtn.setText(filter.mode);
            modeBtn.addEventListener('click', () => {
                filter.mode = filter.mode === 'include' ? 'exclude' : 'include';
                this.plugin.saveSettings();
                this.renderPills(container);
            });

            const label = pill.createSpan('tag-pill-label');
            label.setText(filter.tag);

            const removeBtn = pill.createSpan('tag-pill-remove');
            removeBtn.setText('\u00d7');
            removeBtn.addEventListener('click', () => {
                this.plugin.settings.tagFilters.splice(index, 1);
                this.plugin.saveSettings();
                this.renderPills(container);
            });
        });
    }
}
