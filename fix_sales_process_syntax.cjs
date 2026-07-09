const fs = require('fs');
const file = 'src/components/SalesProcessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    </div>\n      )} \n    </div>\n  );\n};\n`,
  `      )} \n    </div>\n  );\n};\n`
);

fs.writeFileSync(file, content);
