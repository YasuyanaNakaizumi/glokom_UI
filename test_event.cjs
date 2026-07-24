const fs = require('fs');
const path = './src/components/SalesProcessSection.tsx';
let content = fs.readFileSync(path, 'utf8');
if (!content.includes('useEffect(() => {')) {
  console.log("No useEffect");
}
