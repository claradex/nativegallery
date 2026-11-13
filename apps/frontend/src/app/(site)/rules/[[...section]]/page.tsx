import { notFound } from 'next/navigation';
import { rulesContent } from '../../../../features/rules/Rules';

export default async function RulesPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  const Content = rulesContent(['rules', ...(section ?? [])].join('/'));
  if (!Content) notFound();
  return <tr><td className="main"><Content /></td></tr>;
}
