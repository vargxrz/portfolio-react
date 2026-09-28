/**
 * The mark: "jv." — lowercase j + v in the wide, heavy cut of the hero title, closed by the
 * square orange full stop from "deploy.". Pure vector paths (no font needed), so the same
 * shapes work anywhere: header, favicon, CV, social avatar (see public/brand/).
 * Letters use currentColor; the stop uses --accent (themes and the "rgb" egg recolour it).
 */
export const LOGO_PATHS = {
  // j: square tittle, stem, hook to the left below the baseline
  jDot: 'M12 12 H26 V26 H12 Z',
  jBody: 'M12 34 H26 V86 Q26 99 12 99 H2 V88 H7 Q12 88 12 83 Z',
  // v: wide, flat-bottomed like Archivo Expanded ExtraBold
  v: 'M32 34 H47.5 L60 67.5 L72.5 34 H88 L68 78 H52 Z',
  // the full stop
  stop: 'M93 64 H107 V78 H93 Z',
};

const LogoMark = ({ className = '', title }) => (
  <svg
    className={`logo-mark ${className}`}
    viewBox="0 8 110 93"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : 'true'}
    aria-label={title}
    focusable="false"
  >
    <path className="logo-mark__ink" d={LOGO_PATHS.jDot} />
    <path className="logo-mark__ink" d={LOGO_PATHS.jBody} />
    <path className="logo-mark__ink" d={LOGO_PATHS.v} />
    <path className="logo-mark__stop" d={LOGO_PATHS.stop} />
  </svg>
);

export default LogoMark;
