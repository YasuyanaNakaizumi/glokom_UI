const fs = require('fs');
let content = fs.readFileSync('src/components/SalesProcessModal.tsx', 'utf8');

const target1 = "{activeTab === 'quote_prep' && (\n              <div className=\"w-full space-y-8 animate-in fade-in\">";
const target2 = "{activeTab === 'initial_contract' && (\n              <div className=\"w-full space-y-8 animate-in fade-in\">";
const target3 = "{activeTab === 'stock_process' && (\n              <div className=\"w-full space-y-8 animate-in fade-in\">";
const target4 = "{activeTab === 'system_registration' && (\n              <div className=\"w-full space-y-8 animate-in fade-in\">";

content = content.replace(target1, "{activeTab === 'quote_prep' && (\n              <div className=\"max-w-5xl mx-auto w-full space-y-8 animate-in fade-in\">");
content = content.replace(target2, "{activeTab === 'initial_contract' && (\n              <div className=\"max-w-5xl mx-auto w-full space-y-8 animate-in fade-in\">");
content = content.replace(target3, "{activeTab === 'stock_process' && (\n              <div className=\"max-w-5xl mx-auto w-full space-y-8 animate-in fade-in\">");
content = content.replace(target4, "{activeTab === 'system_registration' && (\n              <div className=\"max-w-5xl mx-auto w-full space-y-8 animate-in fade-in\">");

fs.writeFileSync('src/components/SalesProcessModal.tsx', content);
