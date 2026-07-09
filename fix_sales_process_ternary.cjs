const fs = require('fs');
const file = 'src/components/SalesProcessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `      </div>\n      \n      {/* Pending Contracts Modal */}`,
  `      </div>\n      )}\n      {/* Pending Contracts Modal */}`
);

content = content.replace(
  `      )}\n      )} \n    </div>\n  );\n};`,
  `      )}\n    </div>\n  );\n};`
);

fs.writeFileSync(file, content);
