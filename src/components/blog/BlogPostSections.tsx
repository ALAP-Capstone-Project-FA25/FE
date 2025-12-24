import { BlogPostSection } from '@/types/api.types';

interface BlogPostSectionsProps {
  sections: BlogPostSection[];
}

export default function BlogPostSections({ sections }: BlogPostSectionsProps) {
  const sortedSections = [...sections].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <div className="space-y-8">
      {sortedSections.map((section, index) => (
        <div
          key={section.id}
          id={`section-${section.orderIndex}`}
          className="scroll-mt-20"
        >
          <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
      ))}
    </div>
  );
}
