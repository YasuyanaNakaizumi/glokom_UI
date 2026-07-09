const fs = require('fs');
const file = 'src/components/VehicleDetailPanels.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `{parking.map(p => {
              const isSelected = vehicle.parkingAreaIds?.includes(p.id);
              if (!isSelected) return null; // Only show the parking area where it is, or show all and highlight? Let's show all and highlight.
            })}`,
  ''
);

fs.writeFileSync(file, content);
