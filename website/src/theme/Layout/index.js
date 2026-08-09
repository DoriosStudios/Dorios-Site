import React from 'react';
import {useLocation} from '@docusaurus/router';
import OriginalLayout from '@theme-original/Layout';
import SocialMetadata from '../../components/SocialMetadata';

export default function Layout({children, title, description, ...props}) {
  const location = useLocation();
  const socialTitle = typeof title === 'string' && title.trim() ? title : 'Dorios Studios';
  const socialDescription = typeof description === 'string' && description.trim()
    ? description
    : 'Free Minecraft Bedrock add-ons, technical references and community projects.';

  return (
    <OriginalLayout title={title} description={description} {...props}>
      <SocialMetadata
        title={socialTitle}
        parent="Dorios Studios"
        type="Page"
        description={socialDescription}
        path={location.pathname}
        image="/img/dorios_logo_blackbg.png"
        imageAlt="Dorios Studios"
      />
      {children}
    </OriginalLayout>
  );
}
