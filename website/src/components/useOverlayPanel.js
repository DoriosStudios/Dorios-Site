import {useEffect} from 'react';

// Shared keyboard/focus behavior for the header menu and compact wiki panels.
export default function useOverlayPanel(open, close, panelRef, triggerRef, {lockScroll = false} = {}) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    const bodyPadding = document.body.style.paddingRight;
    if (lockScroll) {
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      if (gutter > 0) document.body.style.paddingRight = `${(parseFloat(getComputedStyle(document.body).paddingRight) || 0) + gutter}px`;
      document.body.style.overflow = 'hidden';
    }
    const controls = () => [...(panelRef.current?.querySelectorAll('a[href],button,input,select,[tabindex="0"]') ?? [])]
      .filter(element => !element.disabled && element.getClientRects().length);
    const frame = requestAnimationFrame(() => controls()[0]?.focus());
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const items = controls();
      if (!items.length) return;
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panelRef.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    const outside = event => {
      if (!panelRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', outside);
      if (lockScroll) {document.body.style.overflow = bodyOverflow; document.body.style.paddingRight = bodyPadding;}
      const target = previous?.isConnected ? previous : triggerRef.current;
      if (target?.isConnected) target.focus({preventScroll: true});
    };
  }, [open, close, panelRef, triggerRef, lockScroll]);
}
