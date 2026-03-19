import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import rawData from '@/data/labtools.json';
import ToolDetail from '@/components/ToolDetail';
import { Tool } from '@/components/LabToolsGallery';

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

// Generate static paths for all tools
export const getStaticPaths: GetStaticPaths = async () => {
  const data = rawData as any;
  const tools: Tool[] = data.tools || [];

  const paths = tools.map((tool) => ({
    params: { toolId: (tool as any).toolId || String(tool.name).toLowerCase().replace(/\s+/g, '-') },
  }));

  return {
    paths,
    fallback: false, // Return 404 for unknown tool IDs
  };
};

// Generate static props for each tool
export const getStaticProps: GetStaticProps<ToolPageProps> = async ({ params }) => {
  const data = rawData as any;
  const tools: Tool[] = data.tools || [];

  const tool = tools.find(
    (t) => (t as any).toolId === params?.toolId || String(t.name).toLowerCase().replace(/\s+/g, '-') === params?.toolId
  );

  if (!tool) {
    return { notFound: true };
  }

  return {
    props: {
      tool,
    },
    revalidate: 3600, // ISR: revalidate every hour
  };
};
