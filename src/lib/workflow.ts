import { ServiceTask } from '../types';

export const isTaskResolved = (task?: Pick<ServiceTask, 'progress'> | null) =>
  task?.progress === '完了' || task?.progress === 'スキップ';
