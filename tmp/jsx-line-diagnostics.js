const fs = require('fs');

// Read the PostEditor.tsx file
const filePath = './components/PostEditor.tsx';
const file = fs.readFileSync(filePath, 'utf8');
const lines = file.split('\n');

// Track opening and closing divs with line numbers
const openDivs = [];
const closeDivs = [];

lines.forEach((line, index) => {
  // Count standalone self-closing divs first (they don't need to be paired)
  const selfClosingDivMatches = line.match(/<div[^>]*\/>/g) || [];
  
  // Count regular opening divs
  const openDivMatches = line.match(/<div[^/][^>]*>/g) || [];
  if (openDivMatches.length > 0) {
    openDivMatches.forEach(() => {
      openDivs.push(index + 1); // 1-based line numbers
    });
  }
  
  // Count closing divs
  const closeDivMatches = line.match(/<\/div>/g) || [];
  if (closeDivMatches.length > 0) {
    closeDivMatches.forEach(() => {
      closeDivs.push(index + 1); // 1-based line numbers
    });
  }
});

console.log('Opening divs:', openDivs.length, 'at lines:', openDivs);
console.log('Closing divs:', closeDivs.length, 'at lines:', closeDivs);

// Calculate metrics
console.log('\nDifference in count:', openDivs.length - closeDivs.length);

// Analyze specific opening divs without matching closing divs
if (openDivs.length > closeDivs.length) {
  console.log('\nChecking for potentially unclosed divs...');
  
  // Simple stack-based approach to match opening and closing divs
  const stack = [];
  let currentLineIndex = 0;
  
  for (const line of lines) {
    currentLineIndex++;
    
    // Handle self-closing divs
    const selfClosingDivs = (line.match(/<div[^>]*\/>/g) || []).length;
    
    // Find all opening divs in the current line
    const openMatches = line.match(/<div/g) || [];
    for (let i = 0; i < openMatches.length - selfClosingDivs; i++) {
      stack.push({line: currentLineIndex, content: line.trim()});
    }
    
    // Find all closing divs in the current line
    const closeMatches = line.match(/<\/div>/g) || [];
    for (let i = 0; i < closeMatches.length; i++) {
      if (stack.length > 0) {
        stack.pop();
      }
    }
  }
  
  console.log('\nPotentially unclosed divs:', stack.length);
  console.log('Last 3 unclosed divs:');
  stack.slice(-3).forEach(item => {
    console.log(`Line ${item.line}: ${item.content}`);
  });
}
