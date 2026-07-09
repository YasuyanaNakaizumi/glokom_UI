const fs = require('fs');
let code = fs.readFileSync('src/components/VehicleDetailPanels.tsx', 'utf8');

const endStr = `    </div>
    </div>
    </div>
  );
};
`;
const replaceEndStr = `    </div>
    </div>
  );
};
`;

if (code.endsWith(endStr)) {
  code = code.substring(0, code.length - endStr.length) + replaceEndStr;
  fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
  console.log('Fixed end tags');
} else {
  // Try another variation
  const lastTagIndex = code.lastIndexOf('</div>');
  code = code.substring(0, lastTagIndex) + code.substring(lastTagIndex + 6);
  fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
  console.log('Removed one closing div');
}
