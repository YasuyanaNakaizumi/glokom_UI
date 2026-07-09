const fs = require('fs');
const file = 'src/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `                      </div>
                    );
                  })}
                  {repairTasks.length > 3 && (`,
  `                      </div>
                      </div>
                    );
                  })}
                  {repairTasks.length > 3 && (`
);

content = content.replace(
  `                      </div>
                    );
                  })}
                  {maintenanceTasks.length > 3 && (`,
  `                      </div>
                      </div>
                    );
                  })}
                  {maintenanceTasks.length > 3 && (`
);

fs.writeFileSync(file, content);
