import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Welcome from '@/components/Welcome';
import { Tool } from '@/components/LabToolsGallery';
import { getAllTools } from '@/db/queries';

interface HomeProps {
  tools: Tool[];
}

export default function Home({ tools }: HomeProps) {
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const tools = await getAllTools();
  return { props: { tools } };
};
