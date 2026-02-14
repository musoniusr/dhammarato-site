import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, 'src', 'content', 'blog');

// Get all markdown files
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Extract frontmatter and body
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];

    // Parse existing frontmatter
    let title = '';
    let pubDate = '';
    let youtube = '';
    let description = 'Dhamma talk transcript';

    // Extract title
    const titleMatch = frontmatter.match(/^title:\s*"?(.+?)"?$/m);
    if (titleMatch) title = titleMatch[1].replace(/"/g, '');

    // Extract date (from pubDate or dateoftalk)
    const pubDateMatch = frontmatter.match(/^(pubDate|dateoftalk):\s*(.+)$/m);
    if (pubDateMatch) pubDate = pubDateMatch[2];

    // If no date in frontmatter, extract from filename
    if (!pubDate) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) pubDate = dateMatch[1];
    }

    // Extract YouTube ID from image or body
    const imageMatch = frontmatter.match(/^image:\s*"?https:\/\/i\.ytimg\.com\/vi\/([^\/]+)\//m);
    if (imageMatch) {
      youtube = imageMatch[1];
    } else {
      // Try to find YouTube embed in body
      const embedMatch = body.match(/youtube\.com\/embed\/([^"?]+)/);
      if (embedMatch) youtube = embedMatch[1];
    }

    // Extract description if it exists
    const descMatch = frontmatter.match(/^description:\s*"?(.+?)"?$/m);
    if (descMatch) description = descMatch[1].replace(/"/g, '');

    // Create simplified frontmatter
    let newFrontmatter = `---\ntitle: "${title}"\npubDate: ${pubDate}`;
    if (youtube) newFrontmatter += `\nyoutube: "${youtube}"`;
    if (description && description !== 'Dhamma talk transcript') {
      newFrontmatter += `\ndescription: "${description}"`;
    }
    newFrontmatter += '\n---';

    // Reconstruct file with simplified frontmatter
    const newContent = `${newFrontmatter}\n${body}`;
    fs.writeFileSync(filePath, newContent);
  }
});

console.log(`Standardized ${files.length} transcripts`);