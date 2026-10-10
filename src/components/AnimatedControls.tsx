import { createContext, useContext, useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, PointerEvent, Ref } from 'react';
import DownloadIcon from './ui/download-icon';
import ArrowNarrowDownDashedIcon from './ui/arrow-narrow-down-dashed-icon';
import ArrowNarrowUpDashedIcon from './ui/arrow-narrow-up-dashed-icon';
import type { AnimatedIconHandle } from './ui/types';
import { profile } from '../data/portfolio';

export const IconMotionContext = createContext(false);
type IconKind = 'download' | 'down' | 'up';

// The outer semantic control owns hover/focus. The registry's imperative API
// keeps its original animation, with one shared preference for the 3D world/UI.
function useIconInteraction(kind: IconKind, disabled = false) {
  const reduced = useContext(IconMotionContext);
  const icon = useRef<AnimatedIconHandle>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const running = useRef(false);
  const sync = () => {
    const play = !reduced && !disabled && (hovered.current || focused.current);
    if (play === running.current) return;
    running.current = play;
    if (play) icon.current?.startAnimation();
    else icon.current?.stopAnimation();
  };

  useEffect(() => {
    sync();
    return () => {
      if (running.current) icon.current?.stopAnimation();
      running.current = false;
    };
  }, [reduced, disabled, kind]);

  return {
    icon,
    interaction: {
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'touch') return;
        hovered.current = true;
        sync();
      },
      onPointerLeave: () => { hovered.current = false; sync(); },
      onFocus: () => { focused.current = true; sync(); },
      onBlur: () => { focused.current = false; sync(); },
    },
  };
}

function ControlIcon({ kind, iconRef }: { kind: IconKind; iconRef: Ref<AnimatedIconHandle> }) {
  const Icon = kind === 'download' ? DownloadIcon : kind === 'up' ? ArrowNarrowUpDashedIcon : ArrowNarrowDownDashedIcon;
  return <span className="animated-icon" data-icon={kind} aria-hidden="true">
    <Icon ref={iconRef} size={24} strokeWidth={1.65}/>
  </span>;
}

export function ResumeLink({ className = '' }: { className?: string }) {
  const { icon, interaction } = useIconInteraction('download');
  return <a className={`icon-control resume-control ${className}`} href={profile.resume}
    download="Resume_Ali_ejaz.pdf" aria-label="Download résumé" {...interaction}>
    <span className="control-label">DOWNLOAD RÉSUMÉ</span>
    <ControlIcon kind="download" iconRef={icon}/>
  </a>;
}

interface ChapterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: 'down' | 'up';
  iconFirst?: boolean;
}

export function ChapterButton({ direction = 'down', iconFirst = false, className = '', children, disabled, ...props }: ChapterButtonProps) {
  const { icon, interaction } = useIconInteraction(direction, disabled);
  const glyph = <ControlIcon kind={direction} iconRef={icon}/>;
  return <button type="button" {...props} {...interaction} disabled={disabled}
    className={`icon-control chapter-control ${className}`}>
    {iconFirst && glyph}
    {children && <span className="control-label">{children}</span>}
    {!iconFirst && glyph}
  </button>;
}
