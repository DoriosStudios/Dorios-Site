import React from 'react';
import StaffProfilePage from './index';

export default function StaffProfileRoute({routeData, memberId}) {
  return <StaffProfilePage memberId={routeData?.memberId ?? memberId} />;
}

