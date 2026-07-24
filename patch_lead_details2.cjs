const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Move if (!lead) return null; to after the hooks
content = content.replace("  if (!lead) return null;\n", "");

// Replace lead. with lead?.
content = content.replace(/useState<string>\(lead\.customerName\)/g, "useState<string>(lead?.customerName || '')");
content = content.replace(/useState<string>\(lead\.memo \|\| ''\)/g, "useState<string>(lead?.memo || '')");
content = content.replace(/useState<number \| ''>\(lead\.finalAmount \|\| ''\)/g, "useState<number | ''>(lead?.finalAmount || '')");
content = content.replace(/useState<string>\(lead\.salesTargetId \|\| ''\)/g, "useState<string>(lead?.salesTargetId || '')");

// Add early return after hooks
content = content.replace(
  "  const [createdQuoteId, setCreatedQuoteId] = useState<string>('');",
  "  const [createdQuoteId, setCreatedQuoteId] = useState<string>('');\n\n  if (!lead) return null;"
);

fs.writeFileSync(path, content, 'utf8');
