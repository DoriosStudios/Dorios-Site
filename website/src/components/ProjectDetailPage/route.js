import React from 'react';
import ProjectDetailPage from './index';
import {getProject} from '../../data/projects';

export default function GeneratedProjectRoute({routeData, projectSlug}) {
  return <ProjectDetailPage project={getProject(routeData?.projectSlug ?? projectSlug)} />;
}
