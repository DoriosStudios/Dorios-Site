import React from 'react';
import {AddonWikiEntryPage} from './index';

export default function AddonWikiGeneratedEntry({routeData, ...props}) {
  return <AddonWikiEntryPage {...props} {...routeData} />;
}
