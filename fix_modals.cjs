const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

// 1. Find the start of the return statement
content = content.replace(
  'return (\n    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm"',
  'return (\n    <>\n    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm"'
);

// 2. We need to close the div correctly and add fragment closing.
// We can find the end of the div by looking for the modals at the bottom and putting the closing div BEFORE them.
const targetModals = `      {showAddWorkModal && task && (`;
const replacementModals = `    </div>\n      {showAddWorkModal && task && (`;

content = content.replace(targetModals, replacementModals);

const targetEnd = `      )}
    </div>
  );
}`;
const replacementEnd = `      )}
    </>
  );
}`;

content = content.replace(targetEnd, replacementEnd);

fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched modals');
