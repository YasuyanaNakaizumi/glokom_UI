const fs = require('fs');
let code = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

const { parse } = require('@babel/parser');

try {
  parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"]
  });
  console.log('Valid');
} catch (e) {
  console.log(e.message);
}
