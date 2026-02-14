import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().optional().default('Dhammarato'),
    categories: z.array(z.string()).optional().default(['transcripts', 'Dhamma Talk']),
    tags: z.array(z.string()).optional().default(['transcripts']),
    image: z.string().optional(),
    youtube: z.string().optional(),
    description: z.string().optional().default('Dhamma talk transcript'),
    featured: z.boolean().optional().default(false),
    hidden: z.boolean().optional().default(false),
    toc: z.boolean().optional().default(true),
    assemblyai_transcript_id: z.string().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = { blog };