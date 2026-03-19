import Head from 'next/head';
import Welcome from '@/components/Welcome';
import rawData from '@/data/labtools.json';
import { Tool } from '@/components/LabToolsGallery';

function extractTools(data: any): Tool[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    const maybeTools = data as any[];
    if (maybeTools.length === 0) return [];
    if (maybeTools[0] && typeof maybeTools[0].name === 'string') return maybeTools as Tool[];
    return maybeTools.reduce((acc: Tool[], item: any) => {
      if (item && Array.isArray(item.tools)) acc.push(...item.tools);
      return acc;
    }, []);
  }

  if (data.tools && Array.isArray(data.tools)) return data.tools as Tool[];
  if (data.labs && Array.isArray(data.labs)) {
    return data.labs.reduce((acc: Tool[], lab: any) => {
      if (lab && Array.isArray(lab.tools)) acc.push(...lab.tools);
      return acc;
    }, [] as Tool[]);
  }

  const found: Tool[] = [];
  for (const key of Object.keys(data)) {
    const val = (data as any)[key];
    if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0].name === 'string') {
      found.push(...(val as Tool[]));
    }
  }
  return found;
}

const tools: Tool[] = extractTools(rawData as any);

export default function Home() {
  return (
    <>
      <Head>
        <title>Celano Lab Tools Gallery</title>
        <meta name="description" content="Discover the research tools and equipment at the Celano Nanoelectronics Metrology & Failure Analysis Lab at ASU" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Welcome tools={tools} />
    </>
  );
}
