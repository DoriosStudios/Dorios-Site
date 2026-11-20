import React from 'react';

// CurseForge mark from Simple Icons (CC0):
// https://github.com/simple-icons/simple-icons/blob/develop/icons/curseforge.svg
export function CurseForgeIcon({size = 16, ...props}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...props} fill="currentColor" stroke="none">
    <path d="M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z" />
  </svg>;
}

// Official monochrome MCPEDL icon: https://mcpedl.com/safari-pinned-tab.svg
export function McpedlIcon({size = 16, ...props}) {
  return <svg width={size} height={size} viewBox="0 0 114 114" {...props} fill="currentColor" stroke="none">
    <g transform="translate(0 114) scale(.1 -.1)">
      <path d="M0 570 l0 -570 570 0 570 0 0 570 0 570 -570 0 -570 0 0 -570z m484 291 c37 -6 57 -16 78 -40 l28 -31 0 -233 c0 -261 -2 -268 -68 -287 -20 -5 -94 -10 -164 -10 l-128 0 0 305 0 305 103 -1 c56 0 124 -4 151 -8z m336 -241 l0 -250 50 0 50 0 0 -55 0 -55 -125 0 -125 0 0 305 0 305 75 0 75 0 0 -250z" />
      <path d="M380 565 c0 -198 1 -215 18 -215 45 1 47 9 50 208 3 164 1 192 -13 206 -9 9 -25 16 -36 16 -18 0 -19 -9 -19 -215z" />
    </g>
  </svg>;
}
