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

  // Check if description is missing in frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];

    // Add description if missing
    if (!frontmatter.includes('description:')) {
      // Add description after title
      content = content.replace(/^title:(.+)$/m, `title:$1\ndescription: "Dhamma talk transcript"`);
    }

    // Fix categories if it's not an array format
    content = content.replace(/^categories:\s*$/m, 'categories: [transcripts]');

    // Fix tags if missing
    if (!frontmatter.includes('tags:')) {
      content = content.replace(/^author:(.+)$/m, `author:$1\ntags: [transcripts]`);
    }
  }

  fs.writeFileSync(filePath, content);
});

console.log(`Fixed ${files.length} posts`);