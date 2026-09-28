import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { LEGEND_FONT, legendFontReady } from '../lib/keyboard.js';
import { complete, ready } from '../lib/boot.js';

const canUseWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/**
 * Mounts a KeyboardStage (Three.js) into a sized container. The stage is created and
 * warmed up (shaders compiled, textures uploaded) behind the boot loader; the hero's
 * cap-drop intro only plays once the loader has left.
 * `fallback` renders when WebGL is unavailable.
 */
const KeyboardCanvas = ({ keys, layout, className, onStage, onActivate, onHoverChange, fallback = null }) => {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const handlers = useRef({ onActivate, onHoverChange });
  handlers.current = { onActivate, onHoverChange };
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const bootTask = `stage:${layout}`;
    if (!canUseWebGL()) {
      setStatus('unsupported');
      complete(bootTask);
      return undefined;
    }
    let cancelled = false;
    Promise.all([import('../three/KeyboardStage'), legendFontReady()])
      .then(async ([mod]) => {
        if (cancelled || !ref.current) return;
        const stage = new mod.KeyboardStage({
          container: ref.current,
          keys,
          layout,
          theme: themeRef.current,
          fontFamily: LEGEND_FONT,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          holdIntro: true,
          onActivate: (i) => handlers.current.onActivate?.(i),
          onHoverChange: (i) => handlers.current.onHoverChange?.(i),
        });
        stageRef.current = stage;
        onStage?.(stage);
        setStatus('ready');
        await stage.warmup();
        if (cancelled) return;
        complete(bootTask);
        ready.then(() => !cancelled && stage.playIntro());
      })
      .catch(() => {
        setStatus('unsupported');
        complete(bootTask);
      });
    return () => {
      cancelled = true;
      stageRef.current?.dispose();
      stageRef.current = null;
      onStage?.(null);
    };
    // keys/layout are static per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stageRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <div ref={ref} className={className} data-status={status}>
      {status === 'unsupported' && fallback}
    </div>
  );
};

export default KeyboardCanvas;
