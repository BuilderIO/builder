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
import { connectWithOAuth, disconnectOAuth, isOAuthValid } from './oauth-client';
import { showJobNotification, showOutdatedNotifications, getLangPicks } from './snackbar-utils';
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
        name: 'oauthStatus',
        friendlyName: 'Phrase connection',
        type: 'PhraseOAuthConnect',
        showIf: (options: any) => options.get('authMode') !== 'password',
      },
      {
        name: 'userName',
        type: 'string',
        showIf: (options: any) => options.get('authMode') === 'password',
      },
      {
        name: 'password',
        type: 'password',
        showIf: (options: any) => options.get('authMode') === 'password',
      },
      {
        name: 'templateUId',
        friendlyName: 'Template ID',
        helperText:
          'Template ID is the unique identifier of a Phrase Template used when creating a new Phrase Project',
        type: 'string',
      },
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
            // freshness check placeholder
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
function OAuthConnectButton(props: { value: any; onChange: (v: any) => void; context: any }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const orgSettings =
    appState.user.organization?.value?.settings?.plugins?.get?.(PLUGIN_ID) || ({} as any);
  const [tokens, setTokens] = React.useState(props.value ?? orgSettings.oauth ?? null);
  const connected = isOAuthValid(tokens);
  const isUS = !!orgSettings.isUSDataCenterAccount;

  const onConnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await connectWithOAuth({ isUSDataCenterAccount: isUS });
      setTokens(result); props.onChange(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to connect to Phrase');
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectOAuth();
      setTokens(null); props.onChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {connected ? (
        <>
          <div style={{ color: '#1c7c1c' }}>
            ✓ Connected to Phrase{tokens?.connectedAt ? ` (${new Date(tokens.connectedAt).toLocaleString()})` : ''}
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
