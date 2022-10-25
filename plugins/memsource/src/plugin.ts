import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { registerContentAction, registerContextMenuAction } from './plugin-helpers';
import appState from '@builder.io/app-context';

const authUrl = 'https://cloud.memsource.com/web/api2/v3/auth/login'
const listProjectUrl = 'https://cloud.memsource.com/web/api2/v1/projects'

registerCommercePlugin(
  {
    name: 'Memsource',
    id: pkg.name,
    settings: [
      {
        name: 'username',
        type: 'string',
        required: true,
      },
      {
        name: 'password',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your Memsource account`,
  },
  settings => {
    const basicCache = new Map();

    const username = settings.get('username');
    const password = settings.get('password');

    const baseAuthUrl = `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(authUrl)}`
    const baseListUrl = `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(listProjectUrl)}`


    // right click menu option to exclude from trasnlations
    const transcludedMetaKey = 'excludeFromTranslation';
    registerContextMenuAction({
      label: 'Exclude from future translations',
      showIf(selectedElements) {
        if (selectedElements.length !== 1) {
          // todo maybe apply for multiple
          return false;
        }
        const element = selectedElements[0];
        const isExcluded = element.meta?.get(transcludedMetaKey);
        return element.component?.name === 'Text' && !isExcluded;
      },
      onClick(elements) {
        elements.forEach(el => el.meta.set('excludeFromTranslation', true));
      },
    });

    registerContentAction({
      label: 'Translate',
      showIf(content, model) {
        return (
          content.published === 'published'
        );
      },
      async onClick(content) {
        // TODO: create a new project, send translation to memsource API
        // save translation status to pending
        await appState.updateLatestDraft({
          id: content.id,
          modelId: content.modelId,
          meta: {
            translationStatus: 'pending',
          },
        });
      }
    });

    registerContentAction({
      label: 'Apply translation',
      showIf(content, model) {
        return (
          content.published === 'published'
        );
      },
      async onClick(content) {
        // TODO: read project id from meta content and get the translation and apply it
      }
    });


    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: resource.name,
      handle: resource.customUrl?.url,
      image: {
        src: resource.primary_image?.url_thumbnail || resource.image_url,
      },
    });

    const service = {
      project: {

        async search(search: string) {
          if (!search) return []
          const headers = {
            Accept: 'application/json; charset=utf-8',
            'Content-Type': 'application/json',
            'User-Agent': 'Builder.io/gustavo@builder.io'
          }

          const tokenResponse = await fetch(baseAuthUrl, {
            headers,
            method: 'POST',
            body: JSON.stringify({ userName: username, password })
          }).then((res1) => res1.json())

          // TOKEN FROM RESPONSE
          const token = tokenResponse?.token

          let queryParams = '?';
          queryParams += search ? `&name=${search}` : '';
          const response: any = await fetch(`${baseListUrl}${queryParams}`, {
            headers: {
              ...headers,
              Authorization: `ApiToken ${token}`
            },
          }).then(resp => {
            return resp.json();
          });
          return response.data.map(transformResource);
        },
      },
    };
    return service;
  }
);
