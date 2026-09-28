import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/** Fade/rise on first entry into view. Content is rendered (and readable) without JS animation. */
const Reveal = ({ as = 'div', delay = 0, y = 20, children, ...rest }) => {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const SectionHead = ({ index, label }) => (
  <Reveal className="section-head mono" y={10}>
    <span className="section-head__index">{index}</span>
    <span>{label}</span>
    <span className="section-head__rule" aria-hidden="true" />
  </Reveal>
);

export default Reveal;
