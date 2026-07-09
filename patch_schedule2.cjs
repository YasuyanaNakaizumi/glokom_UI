const fs = require('fs');
const path = './src/views/ScheduleView.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldRenderTasks = `      const leftPct = (startIdx / hours.length) * 100;
      const widthPct = ((endIdx - startIdx) / hours.length) * 100;`;

const newRenderTasks = `      const leftPct = orientation === 'horizontal' ? (startIdx / hours.length) * 100 : 0;
      const widthPct = orientation === 'horizontal' ? ((endIdx - startIdx) / hours.length) * 100 : 100;
      const topPct = orientation === 'vertical' ? (startIdx / hours.length) * 100 : 0;
      const heightPct = orientation === 'vertical' ? ((endIdx - startIdx) / hours.length) * 100 : 100;`;

content = content.replace(oldRenderTasks, newRenderTasks);

// Update the style object
content = content.replace(
  /style=\{\{\s*left: `\$\{leftPct\}%`,\s*width: `\$\{widthPct\}%`,\s*top: '4px',\s*bottom: '4px'\s*\}\}/,
  `style={{
          left: orientation === 'horizontal' ? \`\${leftPct}%\` : '4px',
          width: orientation === 'horizontal' ? \`\${widthPct}%\` : 'calc(100% - 8px)',
          top: orientation === 'vertical' ? \`\${topPct}%\` : '4px',
          height: orientation === 'vertical' ? \`\${heightPct}%\` : 'calc(100% - 8px)',
          bottom: orientation === 'horizontal' ? '4px' : 'auto'
        }}`
);

fs.writeFileSync(path, content, 'utf8');
