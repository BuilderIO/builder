import pkg from '../package.json';
import appState from '@builder.io/app-context';
import { getTranslationModel } from './model-template';

export type Project = {
  targetLocales: Array<{ enabled: boolean; localeId: string; description: string }>;
  sourceLocaleId: string;
  sourceLocaleDescription: string;
  projectId: string;
  projectName: string;
};

export class SmartlingApi {
         private privateKey?: string;
         loaded?: Promise<void>;
         resolveLoaded?: () => void;
         // TODO: basic cache
         getBaseUrl(path: string, search = {}) {
           const params = new URLSearchParams({
             ...search,
             pluginId: pkg.name,
             apiKey: appState.user.apiKey,
           });

           const baseUrl = new URL(`${appState.config.apiRoot()}/api/v1/smartling/${path}`);
           baseUrl.search = params.toString();
           return baseUrl.toString();
         }
         constructor() {
           this.loaded = new Promise(resolve => (this.resolveLoaded = resolve));
           this.init();
         }

         async init() {
           this.privateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
           if (this.privateKey) {
             this.resolveLoaded!();
           }
         }

         isPluginPrivateKeySame(pluginPrivateKey: string) {
           return Boolean(this.privateKey) && this.privateKey === pluginPrivateKey;
         }

         async request(path: string, config?: RequestInit, search = {}) {
           await this.loaded;
           return fetch(`${this.getBaseUrl(path, search)}`, {
             ...config,
             headers: {
               Authorization: `Bearer ${this.privateKey}`,
               'Content-Type': 'application/json',
             },
           }).then(res => res.json());
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

         createLocalJob(name: string, content: any[]): Promise<any> {
           const translationModel = getTranslationModel();
           return appState.createContent(translationModel.name, {
             name,
             meta: {
               createdBy: pkg.name,
             },
             data: {
               entries: content.map(getContentReference),
             },
           });
         }
         async updateLocalJob(jobId: string, content: any[]) {
           const latestDraft = await appState.getLatestDraft(jobId);
           const draft = {
             ...latestDraft,
             data: {
               ...latestDraft.data,
               entries: [
                 ...(latestDraft.data.entries || []),
                 ...content.map(c => getContentReference(c)),
               ],
             },
           };
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
