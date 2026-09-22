import React from 'react';
import LocaleCycleButton from '../../components/LocaleCycleButton';

export default function LocaleCycleNavbarItem({mobile = false, className, ...props}) {
  const button = <LocaleCycleButton {...props} mobile={mobile} className={mobile ? className : `navbar__item ${className ?? ''}`.trim()} />;
  return mobile ? <li className="menu__list-item">{button}</li> : button;
}
