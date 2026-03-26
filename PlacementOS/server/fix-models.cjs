const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix TypeScript interfaces
  content = content.replace(/userId:\s*(?:mongoose\.)?(?:Types|Schema\.Types)\.ObjectId;/g, 'userId: string;');
  content = content.replace(/fromUserId:\s*(?:mongoose\.)?(?:Types|Schema\.Types)\.ObjectId;/g, 'fromUserId: string;');
  content = content.replace(/toProviderId:\s*(?:mongoose\.)?(?:Types|Schema\.Types)\.ObjectId;/g, 'toProviderId: string;');
  
  // Array of interfaces
  content = content.replace(/bookmarkedBy:\s*(?:mongoose\.)?(?:Types|Schema\.Types)\.ObjectId\[\];/g, 'bookmarkedBy: string[];');
  content = content.replace(/appliedBy:\s*(?:mongoose\.)?(?:Types|Schema\.Types)\.ObjectId\[\];/g, 'appliedBy: string[];');

  // Fix Mongoose Schema Definitions (userId, fromUserId, toProviderId)
  content = content.replace(/(\b(?:userId|fromUserId|toProviderId)\b\s*:\s*\{\s*type\s*:\s*)(?:mongoose\.)?(?:Schema\.)?Types\.ObjectId/g, '$1String');
  
  // Fix arrays (bookmarkedBy, appliedBy)
  content = content.replace(/(\b(?:bookmarkedBy|appliedBy)\b\s*:\s*\[\s*\{\s*type\s*:\s*)(?:mongoose\.)?(?:Schema\.)?Types\.ObjectId/g, '$1String');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done mapping ObjectIds to Strings for User IDs.');
