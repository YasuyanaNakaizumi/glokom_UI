const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `            </div>
          </div>
          </>
          )}
        </div>
      )}
    </>
  );
};`;

content = content.replace(/            <\/div>\n          <\/>\n          \)\}\n        <\/div>\n      \)\}\n    <\/>\n  \);\n\};/, replacement);
fs.writeFileSync(path, content, 'utf8');
