const fs = require('fs');

let content = fs.readFileSync('src/components/SalesProcessModal.tsx', 'utf8');

const badRender = `  const renderContractTerms = (template: ContractTemplate) => {
    if (template.type === 'maintenance') {
      return \`定期メンテナンス: \${template.durationMonths}ヶ月 (\${template.inspectionIntervalMonths}ヶ月ごと)\`;
    } else if (template.type === 'warranty') {
      return \`保証延長: \${template.durationMonths}ヶ月\`;
    }
    return '有償サービス・オプション';
  };`;

const goodRender = `  const renderContractTerms = (template: ContractTemplate) => {
    const parts = [];
    if (template.contractPeriodRule && template.contractPeriodRule !== 'none') {
      if (template.contractPeriodRule === 'months' || template.contractPeriodRule === 'years') {
         parts.push(\`契約期間: \${template.contractPeriodValue}\${template.contractPeriodUnit === 'years' ? '年' : 'ヶ月'}\`);
      } else if (template.contractPeriodRule === 'smr') {
         parts.push(\`契約期間: \${template.contractPeriodSmr}SMRまで\`);
      } else if (template.contractPeriodRule === 'whichever_first') {
         parts.push(\`契約期間: \${template.contractPeriodValue}\${template.contractPeriodUnit === 'years' ? '年' : 'ヶ月'} または \${template.contractPeriodSmr}SMR のいずれか早い方\`);
      }
    } else if (template.months || template.smr) {
      if (template.months && template.smr) {
         parts.push(\`契約期間: \${template.months}ヶ月 または \${template.smr}SMR のいずれか早い方\`);
      } else if (template.months) {
         parts.push(\`契約期間: \${template.months}ヶ月\`);
      } else if (template.smr) {
         parts.push(\`契約期間: \${template.smr}SMR\`);
      }
    }
    return parts.join(' / ') || '期間指定なし';
  };`;

content = content.replace(badRender, goodRender);
fs.writeFileSync('src/components/SalesProcessModal.tsx', content);
