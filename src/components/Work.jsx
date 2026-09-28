import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Reveal, { SectionHead } from './Reveal.jsx';
import { useI18n } from '../contexts/I18nContext.jsx';
import './Work.css';

const Flow = ({ steps, label }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scaleX = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div className="flow" ref={ref}>
      <p className="eyebrow flow__label">{label}</p>
      <div className="flow__track" aria-hidden="true">
        <motion.span className="flow__fill" style={{ '--p': scaleX }} />
      </div>
      <ol className="flow__steps">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.title} className="flow__step" delay={i * 0.06} y={14}>
            <span className="flow__node mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h4 className="flow__title">{step.title}</h4>
            <p className="flow__body">{step.body}</p>
            <span className="flow__tag mono">{step.tag}</span>
          </Reveal>
        ))}
      </ol>
    </div>
  );
};

const Work = () => {
  const { t } = useI18n();
  const w = t.work;

  return (
    <section id="trabalho" className="section work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead index={w.index} label={w.label} />

        <article className="case" aria-labelledby="work-title">
          <div className="case__text">
            <Reveal as="p" className="eyebrow case__label">{w.caseLabel}</Reveal>
            <Reveal as="h2" id="work-title" className="title case__title" delay={0.05}>{w.caseTitle}</Reveal>
            <Reveal as="p" className="mono case__meta" delay={0.1}>{w.caseMeta}</Reveal>
            <Reveal as="p" className="lede case__body" delay={0.15}>{w.caseBody}</Reveal>
          </div>

          <Reveal className="metric" delay={0.1} aria-label={`${w.metricFrom} → ${w.metricTo} ${w.metricCaption}`}>
            <p className="metric__from" aria-hidden="true">
              <s>{w.metricFrom}</s>
            </p>
            <p className="metric__to display" aria-hidden="true">{w.metricTo}</p>
            <p className="metric__caption mono" aria-hidden="true">{w.metricCaption}</p>
          </Reveal>
        </article>

        <Flow steps={w.steps} label={w.flowLabel} />

        <div className="shipped">
          <Reveal as="h3" className="subhead">{w.shippedTitle}</Reveal>
          <ul className="shipped__list">
            {w.shipped.map((item, i) => (
              <Reveal as="li" key={item.title} className="shipped__row" delay={i * 0.05}>
                <h4 className="shipped__title">{item.title}</h4>
                <p className="mono shipped__stack">{item.stack}</p>
                <p className="shipped__body">{item.body}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal as="p" className="shipped__testing">
            <CheckCircle2 size={18} strokeWidth={1.8} aria-hidden="true" />
            {w.testing}
          </Reveal>
        </div>

        <div className="projects">
          <Reveal className="projects__head">
            <h3 className="subhead">{w.projectsTitle}</h3>
            <p className="mono projects__note">{w.projectsNote}</p>
          </Reveal>
          <ul className="projects__list">
            {w.projects.map((p, i) => (
              <Reveal as="li" key={p.name} delay={i * 0.05}>
                <a className="project" href={p.href} target="_blank" rel="noopener noreferrer">
                  <span className="mono project__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="project__name">{p.name}</span>
                  <span className="project__desc">{p.desc}</span>
                  <span className="project__tech mono">
                    <span className="project__kind">{p.kind}</span>
                    {p.tech.join(' · ')}
                  </span>
                  <span className="project__go">
                    <span className="visually-hidden">{w.viewCode} — GitHub</span>
                    <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Work;
