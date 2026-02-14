#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TRANSCRIPTS_INPUT_DIR = path.join(__dirname, 'incoming-transcripts');
const BLOG_DIR = path.join(__dirname, 'src', 'content', 'blog');

// Create input directory if it doesn't exist
if (!fs.existsSync(TRANSCRIPTS_INPUT_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_INPUT_DIR, { recursive: true });
  console.log(`Created input directory: ${TRANSCRIPTS_INPUT_DIR}`);
}

// Function to generate filename from title and date
function generateFilename(title, date) {
  // Clean title for filename
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 60); // Limit length

  return `${date}-${cleanTitle}.md`;
}

// Function to extract YouTube ID from various formats
function extractYouTubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Process all files in the input directory
const inputFiles = fs.readdirSync(TRANSCRIPTS_INPUT_DIR).filter(file => file.endsWith('.md') || file.endsWith('.txt'));

if (inputFiles.length === 0) {
  console.log('No transcript files found in incoming-transcripts directory');
  console.log('\nUsage:');
  console.log('1. Place your transcript files in: incoming-transcripts/');
  console.log('2. File should have format:');
  console.log('   ---');
  console.log('   title: "Your Talk Title"');
  console.log('   date: 2024-12-29');
  console.log('   youtube: https://youtube.com/watch?v=VIDEO_ID (optional)');
  console.log('   ---');
  console.log('   Transcript content here...');
  console.log('\n3. Run: npm run process-transcript');
  process.exit(0);
}

inputFiles.forEach(inputFile => {
  const inputPath = path.join(TRANSCRIPTS_INPUT_DIR, inputFile);
  const content = fs.readFileSync(inputPath, 'utf-8');

  // Parse the input file
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    console.error(`Error: ${inputFile} doesn't have valid frontmatter`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const transcript = frontmatterMatch[2].trim();

  // Extract metadata
  const titleMatch = frontmatter.match(/^title:\s*"?(.+?)"?$/m);
  const dateMatch = frontmatter.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
  const youtubeMatch = frontmatter.match(/^youtube:\s*(.+)$/m);

  if (!titleMatch || !dateMatch) {
    console.error(`Error: ${inputFile} missing required title or date`);
    return;
  }

  const title = titleMatch[1].replace(/"/g, '');
  const date = dateMatch[1];
  const youtubeId = youtubeMatch ? extractYouTubeId(youtubeMatch[1]) : null;

  // Generate output filename
  const outputFilename = generateFilename(title, date);
  const outputPath = path.join(BLOG_DIR, outputFilename);

  // Create standardized frontmatter
  let newFrontmatter = `---\ntitle: "${title}"\npubDate: ${date}`;
  if (youtubeId) {
    newFrontmatter += `\nyoutube: "${youtubeId}"`;
  }
  newFrontmatter += `\ndescription: "Dhamma talk transcript"\n---`;

  // Create final content
  const finalContent = `${newFrontmatter}\n\n${transcript}`;

  // Write to blog directory
  fs.writeFileSync(outputPath, finalContent);
  console.log(`✓ Processed: ${title}`);
  console.log(`  → ${outputFilename}`);

  // Move processed file to archive
  const archiveDir = path.join(TRANSCRIPTS_INPUT_DIR, 'processed');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  fs.renameSync(inputPath, path.join(archiveDir, inputFile));
});

console.log(`\nProcessed ${inputFiles.length} transcript(s)`);

// Optional: Git commit
console.log('\nTo deploy, run:');
console.log('  npm run build');
console.log('  npm run deploy');