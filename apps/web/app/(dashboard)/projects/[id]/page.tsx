import React, { Suspense } from 'react';
import ProjectDetailClient from './project-detail-client';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ProjectDetailLoader({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs text-zinc-400 animate-pulse">
          Loading workspace...
        </div>
      }
    >
      <ProjectDetailLoader params={params} />
    </Suspense>
  );
}
