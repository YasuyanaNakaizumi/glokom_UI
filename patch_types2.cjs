const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');
if (!content.includes('linkedAlertIds')) {
    content = content.replace(
        /linkedTaskIds\?: string\[\];/g,
        'linkedTaskIds?: string[];\n  linkedAlertIds?: string[];\n  reportFormatId?: string;\n  paidServiceId?: string;'
    );
    fs.writeFileSync('src/types.ts', content, 'utf-8');
    console.log('patched types.ts');
}
