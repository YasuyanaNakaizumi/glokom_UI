const fs = require('fs');
const file = 'src/types.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  stockPeriod?: {\n    startDate: string;\n    endDate: string;\n    parkingId?: string;\n  };`,
  `  stockPeriod?: {\n    startDate: string;\n    endDate: string;\n    parkingId?: string;\n    isEndDateUndecided?: boolean;\n  };`
);

fs.writeFileSync(file, content);
