/**
 * @builder.io/plugin-phrase-connector — settings UI
 *
 * Drop-in replacement for `src/plugin.tsx` in the Phrase plugin repo.
 * Adds OAuth 2.0 (authorization code) as the primary auth mode while
          { label: 'SSO / OAuth 2.0', value: 'oauth' },
 *
 * Modelled on the existing Memsource integration in
 * `packages/api/src/memsource.ts` of the Builder API monolith.
 */
import * as React from 'react';
import { registerCommercePlugin as registerPlugin } from '@builder.io/commerce-plugin-tools';
import appState from '@builder.io/app-context';
import pkg from '../package.json';
import {
  registerContentAction,
  registerContextMenuAction,
  fastClone,
  registerEditorOnLoad,
  CustomReactEditorProps,
} from './plugin-helpers';
import { PhraseApi } from './phrase-api';
import { connectWithOAuth, disconnectOAuth, isOAuthValid, getSessionOAuth, isSessionDisconnected, readOrgPluginSetting } from './oauth-client';
import { showJobNotification, showOutdatedNotifications, getLangPicks } from './snackbar-utils';
import { getTranslateableFields } from '@builder.io/utils';
import hash from 'object-hash';
import stringify from 'fast-json-stable-stringify';
import { Builder } from '@builder.io/react';

const PLUGIN_ID = pkg.name; // '@builder.io/plugin-phrase-connector'

Builder.registerEditor({
  name: 'PhraseOAuthConnect',
  component: (props: CustomReactEditorProps) => <OAuthConnectButton {...props} />,
});

const enabledTranslationStatuses = ['pending', 'local'];

registerPlugin(
  {
    name: 'Phrase',
    id: PLUGIN_ID,
    settings: [
      {
        name: 'authMode',
        friendlyName: 'Authentication',
        type: 'string',
        enum: [
          { label: 'Username / password', value: 'password' },
          { label: 'SSO / OAuth 2.0', value: 'oauth' },
        ],
        defaultValue: 'password',
      },
      {
        name: 'isUSDataCenterAccount',
        friendlyName: "Account's data center is US based",
        type: 'boolean',
      },
      {
        name: 'oauthClientId',
        friendlyName: 'OAuth Client ID',
        helperText:
          'Client ID of your Phrase Registered OAuth App (Phrase → Settings → Integrations). Enter this before connecting.',
        type: 'string',
        showIf: (options: any) => options.get('authMode') === 'oauth',
      },
      {
        name: 'oauthStatus',
        friendlyName: 'Phrase connection',
        type: 'PhraseOAuthConnect',
        showIf: (options: any) => options.get('authMode') === 'oauth',
      },
      {
        name: 'userName',
        type: 'string',
        showIf: (options: any) => options.get('authMode') !== 'oauth',
      },
      {
        name: 'password',
        type: 'password',
        showIf: (options: any) => options.get('authMode') !== 'oauth',
      },
      {
        name: 'templateUId',
        friendlyName: 'Template ID',
        helperText:
          'Template ID is the unique identifier of a Phrase Template used when creating a new Phrase Project',
        type: 'string',
      },
      // Builder-admin-only overrides for local development (e.g. an ngrok
      // callback host, or pointing the API base at a tunnel). Hidden from
      // regular users.
      ...(appState.user.isBuilderAdmin
        ? [
            { name: 'callbackHost', type: 'string' },
            { name: 'apiHost', type: 'string' },
          ]
        : []),
    ],
    ctaText: 'Connect your Phrase account',
    noPreviewTypes: true,
  },
  async settings => {
    const api = new PhraseApi(settings);

    registerEditorOnLoad(({ safeReaction }) => {
      safeReaction(
        () => String(appState.designerState.editingContentModel?.lastUpdated || ''),
        async shouldCheck => {
          if (!shouldCheck) return;
          const meta = appState.designerState.editingContentModel.meta;
          const isPending = meta.get('translationStatus') === 'pending';
          if (isPending) {
            await checkTranslationFreshness();
          }
        },
        { fireImmediately: true }
      );
    });

    const excludeKey = 'excludeFromTranslation';
    registerContextMenuAction({
      label: 'Exclude from future translations',
      showIf(els) {
        if (els.length !== 1) return false;
        const el = els[0];
        return el.component?.name === 'Text' && !el.meta?.get(excludeKey);
      },
      onClick(els) {
        els.forEach(el => el.meta.set(excludeKey, true));
      },
    });
    registerContextMenuAction({
      label: 'Include in future translations',
      showIf(els) {
        if (els.length !== 1) return false;
        const el = els[0];
        return el.component?.name === 'Text' && !!el.meta?.get(excludeKey);
      },
      onClick(els) {
        els.forEach(el => el.meta.set(excludeKey, false));
      },
    });

    registerContentAction({
      label: 'Translate',
      showIf(content) {
        return (
          content.published === 'published' &&
          !enabledTranslationStatuses.includes(content.meta?.get('translationStatus'))
        );
      },
      async onClick(content) {
        await api.ensureAuthenticated();
        const picks = await getLangPicks();
        if (!picks) return;
        appState.globalState.showGlobalBlockingLoading('Contacting Phrase ....');
        try {
          const { project } = await api.createJob(
            content.id,
            content.modelName,
            picks.sourceLang,
            picks.targetLangs,
            settings.get('callbackHost')
          );
          showJobNotification(project.uid, settings.get('isUSDataCenterAccount'));
        } finally {
          appState.globalState.hideGlobalBlockingLoading();
        }
      },
    });

    registerContentAction({
      label: 'Apply Translation',
      showIf(content) {
        return (
          content.published === 'published' && content.meta.get('translationStatus') === 'pending'
        );
      },
      async onClick(content) {
        await api.ensureAuthenticated();
        appState.globalState.showGlobalBlockingLoading();
        try {
          await api.applyTranslation(content.id, content.modelName);
          appState.snackBar.show('Done!');
        } finally {
          appState.globalState.hideGlobalBlockingLoading();
        }
      },
    });

    registerContentAction({
      label: 'Reset Translation',
      showIf(content) {
        return (
          content.published === 'published' && content.meta.get('translationStatus') === 'pending'
        );
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading();
        const contentMeta = fastClone(content).meta;
        for (const key in contentMeta) {
          if (key.startsWith('translation')) {
            content.meta.delete(key);
          }
        }
        appState.globalState.hideGlobalBlockingLoading();
        appState.snackBar.show('Done!');
      },
    });

    return {};
  }
);

/**
 * React component rendered inside the plugin settings page.
 * Shows a Connect button that opens the Phrase OAuth window, and a
 * Disconnect button when a valid token is already on record.
 */
function OAuthConnectButton(props: CustomReactEditorProps) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const serverOauth = readOrgPluginSetting('oauth');
  const [override, setOverride] = React.useState<{ connected: boolean; connectedAt?: number } | null>(null);
  // The override reflects a connect/disconnect done in *this* org. If the editor
  // isn't remounted across an org switch, drop it so it can't show the previous
  // org's state.
  React.useEffect(() => {
    const sub = appState.globalState.orgSwitched?.subscribe(() => setOverride(null));
    return () => {
      if (typeof sub === 'function') sub();
      else (sub as any)?.unsubscribe?.();
    };
  }, []);
  // Mirror ensureAuthenticated(): connected if the server holds a valid token
  // OR the client session marker set right after connect is still unexpired.
  const session = getSessionOAuth();
  const sessionValid = !!(session && session.expiresAt > Date.now());
  // After a disconnect the in-memory org model may still hold stale oauth
  // metadata until it reloads; ignore it unless a fresh session says otherwise.
  const disconnectedThisSession = isSessionDisconnected() && !sessionValid;
  const connected = override
    ? override.connected
    : !disconnectedThisSession && (isOAuthValid(serverOauth) || sessionValid);
  const connectedAt = override
    ? override.connectedAt
    : serverOauth?.connectedAt ?? session?.connectedAt;
  // Prefer the live edited options (Builder passes the parent object being
  // edited) so an unsaved data-center toggle targets the right Phrase region;
  // fall back to persisted settings.
  const editedOptions = (props as any)?.object;
  const hasEditedOptions = editedOptions && typeof editedOptions.get === 'function';
  const isUS = hasEditedOptions
    ? !!editedOptions.get('isUSDataCenterAccount')
    : !!readOrgPluginSetting('isUSDataCenterAccount');
  // Keep OAuth traffic on the same host jobs use, honouring an unsaved admin
  // apiHost override.
  const apiHostOverride = hasEditedOptions
    ? editedOptions.get('apiHost') || undefined
    : readOrgPluginSetting('apiHost') || undefined;
  // Prefer the live edited Client ID so a first-time connect uses the value the
  // admin just typed (before save); fall back to persisted settings.
  const clientId = hasEditedOptions
    ? editedOptions.get('oauthClientId') || undefined
    : readOrgPluginSetting('oauthClientId') || undefined;

  const onConnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await connectWithOAuth({ isUSDataCenterAccount: isUS, apiHost: apiHostOverride, clientId });
      if (!result?.expiresAt) {
        setError('Phrase did not return a valid session. Please try again.');
        return;
      }
      setOverride({ connected: true, connectedAt: result.connectedAt });
    } catch (e: any) {
      setError(e?.message || 'Failed to connect to Phrase');
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectOAuth({ apiHost: apiHostOverride });
      setOverride({ connected: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {connected ? (
        <>
          <div style={{ color: '#1c7c1c' }}>
            ✓ Connected to Phrase{connectedAt ? ` (${new Date(connectedAt).toLocaleString()})` : ''}
          </div>
          <button disabled={busy} onClick={onDisconnect} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: 'var(--primary-color)', color: 'var(--btn-cta-label)', fontWeight: 500, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: '1rem' }}>
            {busy ? 'Disconnecting…' : 'Disconnect from Phrase'}
          </button>
        </>
      ) : (
        <button disabled={busy} onClick={onConnect} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: 'var(--primary-color)', color: 'var(--btn-cta-label)', fontWeight: 500, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: '1rem' }}>
          {busy ? 'Connecting…' : 'Connect to Phrase'}
        </button>
      )}
      {error ? <div style={{ color: '#c0392b' }}>{error}</div> : null}
    </div>
  );
}

// Warns editors when the published source strings changed after a pending
// Phrase job was created (restored from the original plugin behavior).
async function checkTranslationFreshness() {
  const model = appState.designerState.editingContentModel;
  const translationStatus = model.meta.get("translationStatus");
  const translationRequested = model.meta.get("translationRequested");
  const isFresh = model.lastUpdated > new Date(translationRequested);
  if (!isFresh) return;
  const content = fastClone(model);
  const isPending = translationStatus === "pending";
  const sourceLocale = content.meta?.translationSourceLang;
  const isPublished = content.published === "published";
  if (!isPending || !sourceLocale || !isPublished) return;
  const modelName = appState.designerState.editingModel.name;
  const apiKey = appState.user.apiKey;
  const cdnUrl =
    "https://cdn.builder.io/api/v3/content/" +
    modelName +
    "/" +
    content.id +
    "?apiKey=" +
    apiKey +
    "&cachebust=true";
  const lastPublishedContent = await fetch(cdnUrl).then(res => res.json());
  const translatableFields = getTranslateableFields(lastPublishedContent, sourceLocale, "");
  const currentRevision = hash(stringify(translatableFields), { encoding: "base64" });
  model.meta.set("translationRevisionLatest", currentRevision);
  if (currentRevision !== content.meta.translationRevision) {
    showOutdatedNotifications(async () => {
      appState.globalState.showGlobalBlockingLoading("Contacting Phrase ....");
      appState.globalState.hideGlobalBlockingLoading();
    });
  }
}
