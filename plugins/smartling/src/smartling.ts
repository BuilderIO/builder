import pkg from '../package.json';
import appState from '@builder.io/app-context';
import { getTranslationModel } from './model-template';
import { action } from 'mobx';

export type Project = {
  targetLocales: Array<{ enabled: boolean; localeId: string; description: string }>;
  sourceLocaleId: string;
  sourceLocaleDescription: string;
  projectId: string;
  projectName: string;
};

export interface BatchTranslationRequest {
  name: string;
  description?: string;
  projectId: string;
  targetLocales: string[];
  contentEntries: Array<{
    content: { id: string; model: string };
    preview?: string;
    instruction?: string;
  }>;
}

export class SmartlingApi {
         private privateKey?: string;
         loaded?: Promise<void>;
         resolveLoaded?: () => void;
         public apiVersion: 'v1' | 'v2' | null = null;
         // TODO: basic cache
         
         getBaseUrl(path: string, search = {}, version: 'v1' | 'v2' = 'v1') {
           const params = new URLSearchParams({
             ...search,
             pluginId: pkg.name,
             apiKey: appState.user.apiKey,
           });

           const baseUrl = new URL(`${appState.config.apiRoot()}/api/${version}/smartling/${path}`);
           baseUrl.search = params.toString();
           return baseUrl.toString();
         }
         constructor() {
           this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
           this.init();
           appState.globalState.orgSwitched?.subscribe(
            action(async () => {
              await this.init();
            })
          );
         }

         async init() {
           this.privateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
           if (this.privateKey) {
             // Detect API version on initialization
             await this.detectApiVersion();
             this.resolveLoaded!();
           }
         }

         async detectApiVersion(): Promise<'v1' | 'v2'> {
           if (this.apiVersion) {
             return this.apiVersion;
           }

           try {
             // Try v2 capabilities endpoint first
             const response = await fetch(this.getBaseUrl('batch/capabilities', {}, 'v2'), {
               method: 'GET',
               headers: {
                 Authorization: `Bearer ${this.privateKey}`,
                 'Content-Type': 'application/json',
               },
             });

             if (response.ok) {
               console.log('Smartling: v2 API detected and available');
               this.apiVersion = 'v2';
               return 'v2';
             }
           } catch (error) {
             console.log('Smartling: v2 API not available, falling back to v1');
           }

           // Fallback to v1
           console.log('Smartling: Using v1 API');
           this.apiVersion = 'v1';
           return 'v1';
         }

         isPluginPrivateKeySame(pluginPrivateKey: string) {
           return Boolean(this.privateKey) && this.privateKey === pluginPrivateKey;
         }

         async request(path: string, config?: RequestInit, search = {}, version?: 'v1' | 'v2') {
           await this.loaded;
           const apiVersion = version || this.apiVersion || 'v1';
           return fetch(`${this.getBaseUrl(path, search, apiVersion)}`, {
             ...config,
             headers: {
               Authorization: `Bearer ${this.privateKey}`,
               'Content-Type': 'application/json',
             },
           }).then(res => res.json());
         }

         async requestWithFallback(path: string, config?: RequestInit, search = {}) {
           await this.loaded;
           
           try {
             // Try v2 first if available
             if (this.apiVersion === 'v2') {
               const response = await this.request(path, config, search, 'v2');
               return response;
             }
           } catch (error) {
             console.log(`Smartling: v2 request failed for ${path}, falling back to v1:`, error);
           }

           // Fallback to v1
           return this.request(path, config, search, 'v1');
         }
         // todo separate types
         getProject(id: string): Promise<{ project: Project }> {
           return this.request(`project/${id}`);
         }

         getAllProjects(): Promise<{ results: Project[] }> {
           return this.request('project/all');
         }

         getJob(id: string, projectId: string): Promise<{ job: any }> {
           return this.request('job', { method: 'GET' }, { id, projectId });
         }

         async createLocalJob(name: string, content: any[]): Promise<any> {
           // Use enhanced version that includes symbols
           return this.createLocalJobWithSymbols(name, content);
         }
         async updateLocalJob(jobId: string, content: any[]) {
           const latestDraft = await appState.getLatestDraft(jobId);
           const allContent = [...content];
           const processedSymbols = new Set<string>(); // Avoid duplicates
           
           // Get existing entries to check for duplicate symbols
           const existingEntryIds = new Set((latestDraft.data.entries || []).map((entry: any) => entry.content?.id));
           
           // Extract and include symbol content for updates too
           console.log('Smartling: Extracting symbol references for job update...');
           for (const contentItem of content) {
             try {
               // Fetch the full content to analyze for symbols
               const fullContent = await fetch(
                 `https://cdn.builder.io/api/v3/content/${contentItem.modelName}/${contentItem.id}?apiKey=${appState.user.apiKey}&cachebust=true`
               ).then(res => res.json());
               
               const symbolReferences = await this.extractSymbolReferences(fullContent);
               
               if (symbolReferences.length > 0) {
                 console.log(`Smartling: Found ${symbolReferences.length} symbol references in update content ${contentItem.id}`);
                 
                 // Fetch each symbol and add to update (avoid duplicates)
                 for (const symbolId of symbolReferences) {
                   if (!processedSymbols.has(symbolId) && !existingEntryIds.has(symbolId)) {
                     processedSymbols.add(symbolId);
                     const symbolContent = await this.fetchSymbolContent(symbolId);
                     if (symbolContent) {
                       console.log(`Smartling: Adding symbol ${symbolId} to job update`);
                       allContent.push({
                         id: symbolContent.id,
                         modelName: 'symbol',
                         previewUrl: symbolContent.meta?.lastPreviewUrl || contentItem.previewUrl,
                         instruction: `Symbol referenced in ${contentItem.id}`,
                       });
                     }
                   }
                 }
               }
             } catch (error) {
               console.warn(`Smartling: Error processing symbols for update content ${contentItem.id}:`, error);
             }
           }
           
           const draft = {
             ...latestDraft,
             data: {
               ...latestDraft.data,
               entries: [
                 ...(latestDraft.data.entries || []),
                 ...allContent.map(c => getContentReference(c)),
               ],
             },
           };
           
           const symbolCount = allContent.length - content.length;
           if (symbolCount > 0) {
             console.log(`Smartling: Updating job with ${allContent.length} items (including ${symbolCount} new symbols)`);
           } else {
             console.log(`Smartling: Updating job with ${allContent.length} items (no new symbols)`);
           }
           appState.updateLatestDraft(draft);
         }

         applyTranslation(id: string, model: string) {
           return this.request('apply-translation', {
             method: 'POST',
             body: JSON.stringify({
               id,
               model,
             }),
           });
         }

         removeContentFromTranslationJob({
           contentId,
           contentModel,
           translationJobId,
           translationModel,
         }: {
           contentId: string;
           contentModel: string;
           translationJobId: string;
           translationModel: string;
         }) {
           return this.request('remove-content-from-job', {
             method: 'POST',
             body: JSON.stringify({
               contentId,
               contentModel,
               translationJobId,
               translationModel,
             }),
           });
         }

         updateTranslationFile(options: {
           translationJobId: string;
           translationModel: string;
           preview: string;
           contentId: string;
           contentModel: string;
         }) {
           return this.request('update-translation-file', {
             method: 'POST',
             body: JSON.stringify(options),
           });
         }

         // V2 Batch API Methods
         async createBatchTranslation(batchRequest: BatchTranslationRequest): Promise<any> {
           if (this.apiVersion === 'v2') {
             try {
               console.log('Smartling: Creating batch translation with v2 API');
               return await this.request('batch/create', {
                 method: 'POST',
                 body: JSON.stringify(batchRequest),
               }, {}, 'v2');
             } catch (error) {
               console.log('Smartling: v2 batch creation failed, falling back to v1:', error);
             }
           }

           // Fallback to v1 local job creation with enhanced symbol support
           console.log('Smartling: Using v1 local job creation as fallback');
           return this.createLocalJobWithSymbols(batchRequest.name, batchRequest.contentEntries.map(entry => ({
             id: entry.content.id,
             modelName: entry.content.model,
             previewUrl: entry.preview,
           })));
         }

         // Enhanced local job creation that includes symbols
         async createLocalJobWithSymbols(name: string, content: any[]): Promise<any> {
           const translationModel = getTranslationModel();
           const allContent = [...content];
           const processedSymbols = new Set<string>(); // Avoid duplicates
           
           // Extract and include symbol content
           console.log('Smartling: Extracting symbol references from content...');
           for (const contentItem of content) {
             try {
               // Fetch the full content to analyze for symbols
               const fullContent = await fetch(
                 `https://cdn.builder.io/api/v3/content/${contentItem.modelName}/${contentItem.id}?apiKey=${appState.user.apiKey}&cachebust=true`
               ).then(res => res.json());
               
               const symbolReferences = await this.extractSymbolReferences(fullContent);
               
               if (symbolReferences.length > 0) {
                 console.log(`Smartling: Found ${symbolReferences.length} symbol references in content ${contentItem.id}`);
                 
                 // Fetch each symbol and add to translation job (avoid duplicates)
                 for (const symbolId of symbolReferences) {
                   if (!processedSymbols.has(symbolId)) {
                     processedSymbols.add(symbolId);
                     const symbolContent = await this.fetchSymbolContent(symbolId);
                     if (symbolContent) {
                       console.log(`Smartling: Adding symbol ${symbolId} to translation job`);
                       allContent.push({
                         id: symbolContent.id,
                         modelName: 'symbol',
                         previewUrl: symbolContent.meta?.lastPreviewUrl || contentItem.previewUrl,
                         instruction: `Symbol referenced in ${contentItem.id}`,
                       });
                     }
                   }
                 }
               }
             } catch (error) {
               console.warn(`Smartling: Error processing symbols for content ${contentItem.id}:`, error);
             }
           }
           
           const symbolCount = allContent.length - content.length;
           if (symbolCount > 0) {
             console.log(`Smartling: Creating translation job with ${allContent.length} items (including ${symbolCount} symbols)`);
           } else {
             console.log(`Smartling: Creating translation job with ${allContent.length} items (no symbols found)`);
           }
           
           return appState.createContent(translationModel.name, {
             name,
             meta: {
               createdBy: pkg.name,
               symbolsIncluded: symbolCount > 0, // Track if symbols were included
             },
             data: {
               entries: allContent.map(getContentReference),
             },
           });
         }

         async updateBatchTranslation(jobId: string, additionalContent: any[]): Promise<any> {
           if (this.apiVersion === 'v2') {
             try {
               // For v2, we'll need to create a new batch with existing + new content
               // This is a design decision - v2 batch API might handle updates differently
               console.log('Smartling: v2 batch update - this may require specific implementation');
               // TODO: Implement v2-specific update logic when the API supports it
             } catch (error) {
               console.log('Smartling: v2 batch update failed, falling back to v1:', error);
             }
           }

           // Fallback to v1 local job update
           console.log('Smartling: Using v1 local job update');
           return this.updateLocalJob(jobId, additionalContent);
         }

         async getApiCapabilities(): Promise<any> {
           if (this.apiVersion === 'v2') {
             try {
               return await this.request('batch/capabilities', { method: 'GET' }, {}, 'v2');
             } catch (error) {
               console.log('Smartling: Failed to get v2 capabilities:', error);
             }
           }

           // Return basic v1 capabilities
           return {
             version: 'v1',
             batchSupport: false,
             realTimeUpdates: false,
             endpoints: {
               jobPublishHook: '/api/v1/smartling/job-publish-hook'
             }
           };
         }

         // Enhanced job creation with version detection
         async createTranslationJob(name: string, content: any[], jobDetails?: any): Promise<any> {
           if (this.apiVersion === 'v2' && jobDetails) {
             try {
               const batchRequest: BatchTranslationRequest = {
                 name,
                 description: jobDetails.description,
                 projectId: jobDetails.project,
                 targetLocales: jobDetails.targetLocales || [],
                 contentEntries: content.map(c => ({
                   content: { id: c.id, model: c.modelName },
                   preview: c.previewUrl || c.meta?.get?.('lastPreviewUrl') || c.meta?.lastPreviewUrl,
                   instruction: c.instruction
                 }))
               };

               console.log('Smartling: Creating translation job with v2 batch API');
               return await this.createBatchTranslation(batchRequest);
             } catch (error) {
               console.log('Smartling: v2 job creation failed, falling back to v1:', error);
             }
           }

           // Fallback to v1 local job creation
           console.log('Smartling: Creating translation job with v1 local job');
           return this.createLocalJob(name, content);
         }

         // Enhanced method to extract symbol references from content
         async extractSymbolReferences(content: any): Promise<string[]> {
           const symbolReferences: Set<string> = new Set();
           
           try {
             // Check if content has blocks (visual editor content)
             let blocks = content.data?.blocks;
             if (typeof blocks === 'string') {
               blocks = JSON.parse(blocks);
             }
             
             if (blocks && Array.isArray(blocks)) {
               // Traverse blocks to find symbol references
               this.traverseForSymbols(blocks, symbolReferences);
             }
             
             // Also check other fields that might contain blocks
             if (content.data) {
               Object.values(content.data).forEach((value: any) => {
                 if (typeof value === 'string' && value.includes('"@type":"@builder.io/sdk:Element"')) {
                   try {
                     const parsedBlocks = JSON.parse(value);
                     this.traverseForSymbols(parsedBlocks, symbolReferences);
                   } catch (e) {
                     // Ignore parsing errors
                   }
                 }
               });
             }
           } catch (error) {
             console.warn('Smartling: Error extracting symbol references:', error);
           }
           
           return Array.from(symbolReferences);
         }

         private traverseForSymbols(obj: any, symbolReferences: Set<string>): void {
           if (!obj || typeof obj !== 'object') {
             return;
           }
           
           if (Array.isArray(obj)) {
             obj.forEach(item => this.traverseForSymbols(item, symbolReferences));
             return;
           }
           
           // Check if this is a Symbol component
           if (obj.component?.name === 'Symbol' && obj.component?.options?.symbol?.entry) {
             symbolReferences.add(obj.component.options.symbol.entry);
           }
           
           // Recursively traverse object properties
           Object.values(obj).forEach(value => {
             this.traverseForSymbols(value, symbolReferences);
           });
         }

         // Fetch symbol content for translation
         async fetchSymbolContent(symbolId: string): Promise<any> {
           try {
             const response = await fetch(
               `https://cdn.builder.io/api/v3/content/symbol/${symbolId}?apiKey=${appState.user.apiKey}&cachebust=true`
             );
             
             if (response.ok) {
               return await response.json();
             } else {
               console.warn(`Smartling: Failed to fetch symbol content for ${symbolId}:`, response.status);
               return null;
             }
           } catch (error) {
             console.warn(`Smartling: Error fetching symbol content for ${symbolId}:`, error);
             return null;
           }
         }

         // Check if a translation job still exists
         async checkTranslationJobExists(jobId: string): Promise<boolean> {
           try {
             const translationModel = getTranslationModel();
             if (!translationModel) {
               return false;
             }

             const response = await fetch(
               `https://cdn.builder.io/api/v3/content/${translationModel.name}/${jobId}?apiKey=${appState.user.apiKey}&cachebust=true`
             );
             
             return response.ok;
           } catch (error) {
             console.warn(`Smartling: Error checking translation job existence for ${jobId}:`, error);
             return false;
           }
         }

         // Clean up translation metadata for content referencing deleted jobs
         async cleanupOrphanedTranslationMetadata(content: any): Promise<boolean> {
           const translationJobId = content.meta?.get('translationJobId');
           
           if (!translationJobId) {
             return false;
           }

           const jobExists = await this.checkTranslationJobExists(translationJobId);
           
           if (!jobExists) {
             console.log(`Smartling: Cleaning up orphaned translation metadata for content ${content.id} - job ${translationJobId} no longer exists`);
             
             // Clear the translation metadata
             const updatedMeta = { ...content.meta?.toJS() };
             delete updatedMeta.translationStatus;
             delete updatedMeta.translationJobId;
             delete updatedMeta.translationBy;
             delete updatedMeta.translationRevision;
             delete updatedMeta.translationRevisionLatest;
             delete updatedMeta.translationBatch;
             delete updatedMeta.translationRequested;
             
             try {
               await appState.updateLatestDraft({
                 id: content.id,
                 modelId: content.modelId,
                 meta: updatedMeta,
               });
               
               // Show a subtle notification that the content is now available for translation
               console.log(`Smartling: Content ${content.id} is now available for translation (orphaned job cleanup completed)`);
               
               return true; // Metadata was cleaned up
             } catch (error) {
               console.warn(`Smartling: Failed to cleanup orphaned metadata for ${content.id}:`, error);
             }
           }
           
           return false; // No cleanup needed or cleanup failed
         }
         
       }

function getContentReference(content: any) {
  return {
    content: {
      '@type': '@builder.io/core:Reference',
      id: content.id,
      model: content.modelName,
    },
    preview:
      content.previewUrl || content.meta?.get?.('lastPreviewUrl') || content.meta?.lastPreviewUrl,
  };
}
