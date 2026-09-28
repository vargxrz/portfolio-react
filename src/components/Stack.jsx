import { Award, Languages } from 'lucide-react';
import Reveal, { SectionHead } from './Reveal.jsx';
import { useI18n } from '../contexts/I18nContext.jsx';
import './Stack.css';

const Stack = () => {
  const { t } = useI18n();
  const s = t.stack;

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-title">
      <div className="wrap">
        <SectionHead index={s.index} label={s.label} />

        <div className="stack__intro">
          <Reveal as="h2" id="stack-title" className="title">{s.title}</Reveal>
          <Reveal as="p" className="lede" delay={0.08}>{s.lede}</Reveal>
        </div>

        <dl className="stack__groups">
          {s.groups.map((group, gi) => (
            <Reveal key={group.name} className="stack__group" delay={gi * 0.04}>
              <dt className="mono stack__name">{group.name}</dt>
              <dd>
                <ul className="stack__keys">
                  {group.items.map((item) => (
                    <li key={item} className={`cap${item === 'TDD' ? ' cap--accent' : ''}`}>{item}</li>
                  ))}
                </ul>
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="stack__extras">
          <Reveal className="extra">
            <h3 className="extra__title">
              <Award size={18} strokeWidth={1.7} aria-hidden="true" />
              {s.certsTitle}
            </h3>
            <ul className="extra__list">
              {s.certs.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </Reveal>
          <Reveal className="extra" delay={0.06}>
            <h3 className="extra__title">
              <Languages size={18} strokeWidth={1.7} aria-hidden="true" />
              {s.languagesTitle}
            </h3>
            <ul className="extra__list">
              {s.languages.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Stack;
