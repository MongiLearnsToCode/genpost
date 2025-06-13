const fs = require('fs');

// Read the PostEditor.tsx file
const file = fs.readFileSync('./components/PostEditor.tsx', 'utf8');

// Count opening and closing div tags
const openDivs = file.match(/<div/g) || [];
const closeDivs = file.match(/<\/div>/g) || [];

console.log('Opening div tags:', openDivs.length);
console.log('Closing div tags:', closeDivs.length);

// Count other key JSX tags
const tags = ['span', 'button', 'label', 'input', 'textarea', 'h1', 'h2', 'h3', 'p'];
tags.forEach(tag => {
  const openTags = file.match(new RegExp(`<${tag}`, 'g')) || [];
  const closeTags = file.match(new RegExp(`<\\/${tag}>`, 'g')) || [];
  if (openTags.length !== closeTags.length) {
    console.log(`${tag}: Open=${openTags.length}, Close=${closeTags.length}`);
  }
});
