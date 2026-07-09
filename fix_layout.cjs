const fs = require('fs');
const file = 'src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50">',
  '<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex p-2 z-50 overflow-x-auto gap-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>'
);
content = content.replace(
  'className={cn(\n                "flex flex-col items-center p-2 rounded-lg min-w-[64px]",',
  'className={cn(\n                "flex flex-col items-center p-2 rounded-lg min-w-[72px] shrink-0",'
);

fs.writeFileSync(file, content);
