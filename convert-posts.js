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

  // Replace dateoftalk with pubDate in frontmatter
  content = content.replace(/^dateoftalk:/m, 'pubDate:');

  // Extract date from filename if no date present
  const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch && !content.includes('pubDate:')) {
    // Add pubDate after title in frontmatter
    content = content.replace(/^title:(.+)$/m, `title:$1\npubDate: ${dateMatch[1]}`);
  }

  fs.writeFileSync(filePath, content);
});

console.log(`Converted ${files.length} posts`);