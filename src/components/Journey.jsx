import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import Reveal, { SectionHead } from './Reveal.jsx';
import { useI18n } from '../contexts/I18nContext.jsx';
import './Journey.css';

const NODE_OFFSET = 12; // centre of a node relative to its item's top

const Journey = () => {
  const { t } = useI18n();
  const j = t.journey;
  const listRef = useRef(null);
  const olRef = useRef(null);
  const [railH, setRailH] = useState(0);
  const [stops, setStops] = useState([]);
  const [reached, setReached] = useState(-1);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 70%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

  // Oldest job at the top, current at the bottom: the rail runs from the first node to the last.
  useLayoutEffect(() => {
    const ol = olRef.current;
    if (!ol) return undefined;
    const measure = () => {
      const items = [...ol.children];
      if (!items.length) return;
      const first = items[0].offsetTop + NODE_OFFSET;
      const last = items[items.length - 1].offsetTop + NODE_OFFSET;
      const h = Math.max(1, last - first);
      setRailH(h);
      setStops(items.map((el) => (el.offsetTop + NODE_OFFSET - first) / h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [j]);

  useMotionValueEvent(grow, 'change', (p) => {
    let idx = -1;
    stops.forEach((s, i) => { if (p >= s - 0.01) idx = i; });
    setReached(idx);
  });

  return (
    <section id="trajetoria" className="section journey" aria-labelledby="journey-title">
      <div className="wrap">
        <SectionHead index={j.index} label={j.label} />

        <div className="journey__grid">
          <div className="journey__intro">
            <Reveal as="h2" id="journey-title" className="title">{j.title}</Reveal>
            <Reveal as="p" className="lede journey__lede" delay={0.08}>{j.lede}</Reveal>
          </div>

          <div className="timeline" ref={listRef}>
            <div className="timeline__rail" style={{ height: railH }} aria-hidden="true">
              <motion.span className="timeline__rail-fill" style={{ scaleY: grow }} />
            </div>
            <ol ref={olRef}>
              {j.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.when}
                  className={`timeline__item${item.current ? ' is-current' : ''}${i <= reached ? ' is-reached' : ''}`}
                  delay={i * 0.05}
                >
                  <span className="timeline__node" aria-hidden="true" />
                  <p className="mono timeline__when">
                    {item.when}
                    {item.current && <span className="timeline__now">{j.now}</span>}
                  </p>
                  <h3 className="timeline__role">{item.role}</h3>
                  <p className="timeline__org">{item.org}</p>
                  <p className="timeline__body">{item.body}</p>
                </Reveal>
              ))}
            </ol>

            <Reveal className="education">
              <GraduationCap size={22} strokeWidth={1.6} aria-hidden="true" />
              <div>
                <p className="eyebrow">{j.educationLabel}</p>
                <p className="education__name">{j.education}</p>
                <p className="mono education__when">{j.educationWhen}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
