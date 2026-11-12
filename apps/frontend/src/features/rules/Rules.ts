import { readTemplate } from '../../components/ReadTemplate';

const templates = new Map([
  ['rules', 'src/features/rules/Rules.html'],
  ['rules/photo', 'src/features/rules/PhotoRules.html'],
  ['rules/video', 'src/features/rules/VideoRules.html'],
  ['rules/pub', 'src/features/rules/PublicationRules.html'],
]);

export function Rules(path: string) {
  const file = templates.get(path);
  return file ? readTemplate(file) : undefined;
}
