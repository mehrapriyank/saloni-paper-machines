import { Routes, Route } from 'react-router-dom';

import { ProjectList } from '../../pages/project-list/project-list.page';
import { Project } from '../../pages/project/project.page';

export const ProjectRoute = () => {
  return (
    <Routes>
      <Route index element={<ProjectList />} />
      <Route path=':project' element={<Project />} />
    </Routes>
  );
};
