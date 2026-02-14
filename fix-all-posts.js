import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, 'src', 'content', 'blog');

// Get all markdown files
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Check if we have frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (frontmatterMatch) {
    let frontmatter = frontmatterMatch[1];
    const restContent = content.slice(frontmatterMatch[0].length);

    // Check if description is missing
    if (!frontmatter.includes('description:')) {
      // Add description after title
      const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
      if (titleMatch) {
        const titleLine = titleMatch[0];
        frontmatter = frontmatter.replace(titleLine, titleLine + '\ndescription: "Dhamma talk transcript"');
        modified = true;
      }
    }

    // If modified, reconstruct the file
    if (modified) {
      content = `---\n${frontmatter}\n---${restContent}`;
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  }
});

console.log(`\nTotal fixed: ${fixedCount} posts`);