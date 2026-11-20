import React from 'react';
import renderRoutes from '@docusaurus/renderRoutes';
import {useLocation} from '@docusaurus/router';
import NotFound from '@theme/NotFound';

const indexes = new WeakMap();
const pathKey = pathname => pathname.replace(/\/$/, '').toLowerCase();

export default function GeneratedRouteGroup({route}) {
  const {pathname} = useLocation();
  let index = indexes.get(route.routes);
  if (!index) {
    index = new Map();
    for (const child of route.routes) {
      if (!child.exact || /[:*?()[\]]/.test(child.path)) continue;
      const key = pathKey(child.path);
      if (!index.has(key)) index.set(key, child);
    }
    indexes.set(route.routes, index);
  }
  let selected = index.get(pathKey(pathname));
  if (!selected) {
    try { selected = index.get(pathKey(decodeURI(pathname))); } catch { /* Fall through to the router's 404 handling. */ }
  }
  // Avoid constructing thousands of React Route elements for every detail tab.
  // renderRoutes still checks the selected path and provides normal route props.
  return renderRoutes([...(selected ? [selected] : route.routes), {component: NotFound}]);
}
