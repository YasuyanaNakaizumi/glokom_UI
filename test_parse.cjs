const fs = require('fs');
let code = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

try {
  require('@babel/core').transformSync(code, {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    filename: 'test.tsx'
  });
  console.log('Valid');
} catch (e) {
  console.error(e.message);
}
