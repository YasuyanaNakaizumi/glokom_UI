const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');
if (!content.includes('linkedTaskIds')) {
    content = content.replace(
        /chatMessages\?: ChatMessage\[\];/g,
        'chatMessages?: ChatMessage[];\n  linkedTaskIds?: string[];'
    );
    fs.writeFileSync('src/types.ts', content, 'utf-8');
    console.log('patched types.ts');
}
