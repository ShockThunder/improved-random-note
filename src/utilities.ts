import { App, CachedMetadata } from 'obsidian';
import { TagFilesMap } from './types';

export function getTagFilesMap(app: App): TagFilesMap {
    const metadataCache = app.metadataCache;
    const markdownFiles = app.vault.getMarkdownFiles();

    const tagFilesMap: TagFilesMap = {};

    for (const markdownFile of markdownFiles) {
        const cachedMetadata = metadataCache.getFileCache(markdownFile);

        if (cachedMetadata) {
            const cachedTags = getCachedTags(cachedMetadata);
            if (cachedTags.length) {
                for (const cachedTag of cachedTags) {
                    if (tagFilesMap[cachedTag]) {
                        tagFilesMap[cachedTag].push(markdownFile);
                    } else {
                        tagFilesMap[cachedTag] = [markdownFile];
                    }
                }
            }
        }
    }

    return tagFilesMap;
}

function getCachedTags(cachedMetadata: CachedMetadata): string[] {
    let bodyTags: string[] = cachedMetadata.tags?.map((x) => x.tag) || [];
    let frontMatterTags: string[] = [];
    if (cachedMetadata.frontmatter?.tags)
    {
        if (Array.isArray(cachedMetadata.frontmatter?.tags))
            frontMatterTags = cachedMetadata.frontmatter?.tags;
        else
            frontMatterTags = cachedMetadata.frontmatter?.tags.split(' ');
    }
    
    let frontMatterTags2: string[] = [];    
    if (cachedMetadata.frontmatter?.tag){
        if (Array.isArray(cachedMetadata.frontmatter?.tag))
            frontMatterTags2 = cachedMetadata.frontmatter?.tag;
        else
            frontMatterTags2 = cachedMetadata.frontmatter?.tag.split(' ');
    }

    // frontmatter tags might not have a hashtag in front of them
    if (frontMatterTags.length > 0){
        frontMatterTags = frontMatterTags.map((x) => {
            if (x) {
                return (x.startsWith('#') ? x : '#' + x);
            }
        })
    }
    
    if (frontMatterTags2.length > 0){
        frontMatterTags2 = frontMatterTags2.map((x) => {
            if (x) {
                return (x.startsWith('#') ? x : '#' + x);
            }
        })
    }
    const cachedTags = bodyTags.concat(frontMatterTags).concat(frontMatterTags2);

    return cachedTags;
}

export function randomElement<T>(array: T[]): T {
    return array[(array.length * Math.random()) << 0];
}
