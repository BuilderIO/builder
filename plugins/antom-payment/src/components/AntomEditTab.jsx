/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useRef, useState } from 'react';
import appState from '@builder.io/app-context';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createOfficialInstallPrompt, OFFICIAL_SKILL_SOURCE } from '../officialSkillInstall.mjs';
import { copyPlainText } from '../clipboard.mjs';
import { SKILL_OPTIONS } from '../skillOptions.mjs';
import AntomUsageGuide from './AntomUsageGuide';

const INSTALL_COPY_KEY = 'install-prompt';
const buttonStyle = { textTransform: 'none' };
const smallTextStyle = { fontSize: '12px', lineHeight: 1.5 };

/** No network, project-file access or payment settings: only copy an installation prompt. */
const AntomEditTab = () => {
  const [selectedSkills, setSelectedSkills] = useState(['integration']);
  const [copiedText, setCopiedText] = useState('');
  const [copyingKey, setCopyingKey] = useState('');
  const [manualRequest, setManualRequest] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const mountedRef = useRef(false);
  const copyLockRef = useRef(false);
  const copySequenceRef = useRef(0);
  const selectionRevisionRef = useRef(0);
  const copyResetTimer = useRef(null);
  const selectionRevision = selectionRevisionRef.current;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      copySequenceRef.current += 1;
      copyLockRef.current = false;
      clearTimeout(copyResetTimer.current);
    };
  }, []);

  const showMessage = (message) => {
    if (mountedRef.current) appState?.snackBar?.show?.(message, 4000);
  };

  const copyContent = async (text, key) => {
    if (!mountedRef.current || copyLockRef.current || selectionRevision !== selectionRevisionRef.current) return;
    copyLockRef.current = true;
    const sequence = ++copySequenceRef.current;
    const isCurrent = () => mountedRef.current && sequence === copySequenceRef.current;
    setCopyingKey(key);
    setCopiedText('');
    setManualRequest('');
    clearTimeout(copyResetTimer.current);
    try {
      await copyPlainText(text);
      if (!isCurrent()) return;
      setCopiedText(key);
      if (key === INSTALL_COPY_KEY) showMessage('Prompt copied. Paste in Builder Agent to install.');
      copyResetTimer.current = setTimeout(() => { if (isCurrent()) setCopiedText(''); }, 3000);
    } catch {
      if (!isCurrent()) return;
      if (key === INSTALL_COPY_KEY) setManualRequest(text);
      showMessage('Clipboard unavailable. Copy the displayed text manually.');
    } finally {
      if (isCurrent()) {
        copyLockRef.current = false;
        setCopyingKey('');
      }
    }
  };

  const toggleSkill = (id) => {
    if (copyLockRef.current) return;
    selectionRevisionRef.current += 1;
    clearTimeout(copyResetTimer.current);
    setSelectedSkills((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setCopiedText('');
    setManualRequest('');
  };

  const copyInstallPrompt = () => {
    if (!selectedSkills.length || selectionRevision !== selectionRevisionRef.current) return;
    return copyContent(createOfficialInstallPrompt(selectedSkills), INSTALL_COPY_KEY);
  };

  return (
    <div css={{ padding: '12px', height: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'auto', overflowWrap: 'anywhere' }}>
      <Typography variant="h6" css={{ fontSize: '16px', marginBottom: '12px' }}>Antom Skills</Typography>
      <Card data-testid="setup-in-builder" css={{ marginBottom: '12px' }}>
        <CardContent>
          <Typography variant="subtitle1" css={{ fontSize: '15px', marginBottom: '8px' }}>1. Install Skills</Typography>
          <div css={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            {SKILL_OPTIONS.map(({ id, label }) => (
              <label key={id} css={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" value={id} checked={selectedSkills.includes(id)} disabled={Boolean(copyingKey)} onChange={() => toggleSkill(id)} />
                {label}
              </label>
            ))}
          </div>
          <Typography variant="body2" color="textSecondary" css={{ ...smallTextStyle, marginBottom: '12px' }}>
            Paste in Builder Agent to fetch official Skill files and save them in .builder/skills using project file tools. Missing folders are created; existing Skill files are not overwritten.
          </Typography>
          <Button type="button" variant="contained" color="primary" size="small" onClick={copyInstallPrompt}
            disabled={!selectedSkills.length || Boolean(copyingKey)} style={buttonStyle}>
            {copyingKey === INSTALL_COPY_KEY ? 'Copying…' : copiedText === INSTALL_COPY_KEY ? 'Prompt copied' : 'Copy install prompt'}
          </Button>
          <div role="status" aria-live="polite" css={{ ...smallTextStyle, marginTop: '8px', color: '#616161' }}>
            {selectedSkills.length ? 'Copying does not install Skills. Installation must be verified in Agent.' : 'Select at least one Skill.'}
          </div>
          {manualRequest && (
            <div css={{ ...smallTextStyle, marginTop: '12px' }}>
              <p role="alert">Clipboard unavailable. Copy this prompt into Builder Agent.</p>
              <textarea aria-label="Install prompt to copy manually" readOnly value={manualRequest} rows={5}
                onFocus={(event) => event.currentTarget.select()}
                css={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '11px', padding: '8px', resize: 'vertical' }} />
              <Button type="button" size="small" onClick={() => setManualRequest('')} style={buttonStyle}>Dismiss</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card data-testid="start-chat" css={{ marginBottom: '12px' }}>
        <CardContent>
          <Typography variant="subtitle1" css={{ fontSize: '15px', marginBottom: '4px' }}>2. Use Skills</Typography>
          <Typography variant="body2" color="textSecondary" css={smallTextStyle}>
            After Agent verifies installation, start a new Builder chat and use an example.
          </Typography>
          {SKILL_OPTIONS.filter(({ id }) => selectedSkills.includes(id)).map(({ id, label, example }) => (
            <div key={id} css={{ marginTop: '10px' }}>
              {selectedSkills.length > 1 && <Typography variant="body2" css={{ fontWeight: 600 }}>{label}</Typography>}
              <p css={{ fontSize: '13px', lineHeight: 1.5, margin: '6px 0' }}>{example}</p>
              <Button type="button" variant="outlined" size="small" onClick={() => copyContent(example, example)} disabled={Boolean(copyingKey)} style={buttonStyle}>
                {copiedText === example ? 'Example copied' : 'Copy example'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Typography variant="body2" color="textSecondary" css={smallTextStyle}>
        Source: <a href={OFFICIAL_SKILL_SOURCE.repository} target="_blank" rel="noopener noreferrer">ant-intl/antom-ai-tools</a>
      </Typography>
      <Button type="button" size="small" onClick={() => setGuideOpen(true)} style={buttonStyle}>Usage guide</Button>
      <AntomUsageGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

export default AntomEditTab;
