import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import ToolDetail from '@/components/ToolDetail';
import { Tool } from '@/components/LabToolsGallery';
import { getToolById } from '@/db/queries';

interface ToolPageProps {
  tool: Tool;
}

export default function ToolPage({ tool }: ToolPageProps) {
  if (!tool) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Tool Not Found</h1>
        <Link href="/">← Back to Gallery</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{tool.name} - Lab Tools Gallery</title>
        <meta name="description" content={tool.shortDescription || tool.name} />
      </Head>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Link href="/" style={{ color: '#0f62fe', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Gallery
        </Link>
        <ToolDetail tool={tool} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ToolPageProps> = async ({ params }) => {
  const toolId = params?.toolId;
  if (typeof toolId !== 'string') {
    return { notFound: true };
  }

  const tool = await getToolById(toolId);
  if (!tool) {
    return { notFound: true };
  }

  return { props: { tool } };
};
