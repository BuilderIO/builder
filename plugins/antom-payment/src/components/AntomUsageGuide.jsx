/** @jsx jsx */
import { jsx } from '@emotion/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { OFFICIAL_SKILL_SOURCE } from '../officialSkillInstall.mjs';

/** Local help stays available without opening an external documentation site. */
const AntomUsageGuide = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} aria-labelledby="antom-usage-guide-title" fullWidth maxWidth="sm"
    PaperProps={{ style: { margin: 16, width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)' } }}>
    <DialogTitle id="antom-usage-guide-title">Usage guide</DialogTitle>
    <DialogContent dividers css={{ fontSize: '13px', lineHeight: 1.5, overflowWrap: 'anywhere', '& p': { margin: '0 0 14px' }, '& p:last-child': { marginBottom: 0 } }}>
      <p><strong>Install.</strong> This plugin currently offers only antom-integration. Select Payment integration, copy the install prompt and paste it in the current Builder Agent. The Agent retrieves complete original files from ant-intl/antom-ai-tools at a fixed commit, then writes them using native project file tools. Your project does not need to be connected to GitHub.</p>
      <p><strong>Destination.</strong> Reuse {OFFICIAL_SKILL_SOURCE.targetDirectory} if it exists; otherwise the Agent creates it. Each Skill keeps its own directory and original supporting files. Preserve unrelated Skills. If same-named Skill files already exist, stop and report them without overwriting.</p>
      <p><strong>Requirements.</strong> The Agent needs permitted source-reading and project file tools. This flow uses no terminal installer or runtime-version checks. Obtain the full source file list and raw contents before writing; HTML wrappers, summaries and incomplete responses are not source files. Stop on denied operations without changing ACL policies.</p>
      <p><strong>Verify.</strong> Read back the destination files and compare their paths and contents with the retrieved source. Report retrieval, writes and comparison separately. If a write fails, report any files already written. An unsupported comparison is unverified, not success. No lock file is created or changed.</p>
      <p><strong>Use.</strong> After the Agent verifies the installed files, start a new chat and paste the selected Skill example. Copying a prompt does not install or verify anything. Review security warnings before use.</p>
      <p><strong>Scope.</strong> This plugin does not configure payment credentials, modify environment files or process payments itself. Configure real credentials separately in your project's server-side Secrets, never in plugin settings or chat.</p>
    </DialogContent>
    <DialogActions>
      <Button type="button" onClick={onClose} color="primary" style={{ textTransform: 'none' }}>Done</Button>
    </DialogActions>
  </Dialog>
);

export default AntomUsageGuide;
