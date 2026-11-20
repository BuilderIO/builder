export const SKILL_OPTIONS = Object.freeze([
  Object.freeze({
    id: 'integration', name: 'antom-integration', label: 'Payment integration',
    example: 'Use antom-integration to add Antom sandbox payments to this project.',
  }),
]);

export function getSkillSelectionKey(selection) {
  if (!Array.isArray(selection) || !selection.length) throw new Error('Select at least one Skill.');
  const allowed = SKILL_OPTIONS.map(({ id }) => id);
  if (selection.some((id) => typeof id !== 'string' || !allowed.includes(id))) {
    throw new Error('Unsupported Skill selection.');
  }
  return allowed.filter((id) => selection.includes(id)).join(',');
}
