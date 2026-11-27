import React, {useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useSiteI18n} from '../../i18n/site';
import {enchantmentConflicts} from '../../wiki/enchantmentLibrary.mjs';
import {miningEstimate, formatMiningRange} from '../../wiki/enchantmentEstimates.mjs';
import styles from './styles.module.css';

const roman = ['', 'I', 'II', 'III', 'IV', 'V'];
const copy = {
  en: {
    title:'Enchantment workshop', library:'Compatible enchantments', compare:'Compare', base:'Base', preview:'Build preview', stat:'Stat',
    add:'Add', remove:'Remove', replace:'Replace', clear:'Clear build', level:'Level', none:'No enchantments applied',
    onePoint:'One-point uses', estimated:'Estimate', drops:'Drops', standard:'Standard', yield:'Variable yield by block',
    silk:'Block itself where supported', repair:'Repair', manual:'Manual', xp:'Manual + XP', death:'On death', vanishes:'Item vanishes',
    assumptions:'Mining estimates cover eligible blocks under the same conditions. Hardness and tick rounding affect actual break time.',
    contextual:'Varies by target',
    conditional:'Armor wear, combat bonuses and scripted drops depend on the event or target.', swap: name => 'Replaces ' + name,
  },
  'pt-BR': {
    title:'Bancada de encantamentos', library:'Encantamentos compatíveis', compare:'Comparar', base:'Base', preview:'Prévia da combinação', stat:'Atributo',
    add:'Adicionar', remove:'Remover', replace:'Trocar', clear:'Limpar', level:'Nível', none:'Nenhum encantamento aplicado',
    onePoint:'Usos de 1 ponto', estimated:'Estimativa', drops:'Drops', standard:'Padrão', yield:'Rendimento variável por bloco',
    silk:'O próprio bloco, quando compatível', repair:'Reparo', manual:'Manual', xp:'Manual + XP', death:'Ao morrer', vanishes:'O item desaparece',
    assumptions:'A estimativa de mineração considera blocos elegíveis nas mesmas condições. Dureza e arredondamento em ticks afetam o tempo real.',
    contextual:'Varia com o alvo',
    conditional:'Desgaste de armadura, bônus de combate e drops por script dependem do evento ou alvo.', swap: name => 'Substitui ' + name,
  },
  'es-MX': {
    title:'Banco de encantamientos', library:'Encantamientos compatibles', compare:'Comparar', base:'Base', preview:'Vista de la combinación', stat:'Atributo',
    add:'Añadir', remove:'Quitar', replace:'Cambiar', clear:'Limpiar', level:'Nivel', none:'Sin encantamientos aplicados',
    onePoint:'Usos de 1 punto', estimated:'Estimación', drops:'Botín', standard:'Normal', yield:'Rendimiento variable por bloque',
    silk:'El bloque mismo, cuando es compatible', repair:'Reparación', manual:'Manual', xp:'Manual + XP', death:'Al morir', vanishes:'El objeto desaparece',
    assumptions:'La estimación de minería usa bloques compatibles en las mismas condiciones. La dureza y el redondeo de ticks cambian el tiempo real.',
    contextual:'Varía según el blanco',
    conditional:'El desgaste de armadura, las bonificaciones de combate y el botín por script dependen del evento o blanco.', swap: name => 'Sustituye ' + name,
  },
};

export default function EnchantmentWorkshop({name, image, profile, books, w}) {
  const {locale, formatNumber} = useSiteI18n();
  const labels = copy[locale] ?? copy.en;
  const [active, setActive] = useState({});
  const [panel, setPanel] = useState('library');
  const itemImage = useBaseUrl(image ?? '');
  const bookIcon = useBaseUrl('/img/wiki/vanilla/Items/book_enchanted.png');
  const speed = miningEstimate(profile.range, active.Efficiency, profile.efficiency);
  const unbreaking = active.Unbreaking ?? 0;
  const usesMultiplier = profile.wearable ? 1 / (.6 + .4 / (unbreaking + 1)) : unbreaking + 1;
  function toggle(book) {
    setActive(current => {
      const next = {...current};
      if (next[book.name]) delete next[book.name];
      else {
        for (const conflict of enchantmentConflicts(current, book.name)) delete next[conflict];
        next[book.name] = book.maxLevel;
      }
      return next;
    });
  }
  const formatGain = rates => rates && (rates[0] === rates[1]
    ? '+' + formatNumber(rates[0]) + '%'
    : '+' + formatNumber(rates[0]) + '–' + formatNumber(rates[1]) + '%');
  const attackModifier = ['Sharpness', 'Smite', 'Bane of Arthropods'].find(book => active[book]);
  const rows = [
    speed && [w('Mining speed'), formatMiningRange(profile.range, formatNumber),
      (speed.bonus ? '≈ ' : '') + formatMiningRange(speed.range, formatNumber),
      speed.bonus ? (formatGain(speed.improvement) ?? '+' + formatNumber(speed.bonus)) + ' · ' + w('Efficiency') + ' ' + roman[active.Efficiency] : null],
    profile.durability && [labels.onePoint, formatNumber(profile.durability),
      (unbreaking ? '≈ ' : '') + formatNumber(Math.round(profile.durability * usesMultiplier)),
      unbreaking ? formatGain([Math.round((usesMultiplier - 1) * 100), Math.round((usesMultiplier - 1) * 100)]) + ' · ' + w('Unbreaking') : null],
    Number.isFinite(profile.damage) && [w('Attack damage'), formatNumber(profile.damage),
      attackModifier ? labels.contextual : formatNumber(profile.damage),
      attackModifier ? w(attackModifier) + ' ' + roman[active[attackModifier]] : null],
    books.some(book => ['Fortune', 'Silk Touch'].includes(book.name)) && [labels.drops, labels.standard,
      active.Fortune ? labels.yield : active['Silk Touch'] ? labels.silk : labels.standard,
      active.Fortune ? w('Fortune') + ' ' + roman[active.Fortune] : active['Silk Touch'] ? w('Silk Touch') : null],
    profile.durability && [labels.repair, labels.manual, active.Mending ? labels.xp : labels.manual, active.Mending ? w('Mending') : null],
    active['Curse of Vanishing'] && [labels.death, labels.standard, labels.vanishes, w('Curse of Vanishing')],
  ].filter(Boolean);
  return (
    <section className={styles.workshop} data-panel={panel} aria-labelledby="enchanting-heading">
      <h2 id="enchanting-heading">{labels.title}</h2>
      <div className={styles.switch} role="group" aria-label={labels.title}>
        <button type="button" aria-pressed={panel === 'library'} onClick={() => setPanel('library')}>{labels.library}</button>
        <button type="button" aria-pressed={panel === 'preview'} onClick={() => setPanel('preview')}>{labels.compare}</button>
      </div>
      <div className={styles.columns}>
        <section className={styles.library} aria-label={labels.library}>
          <h3>{labels.library}</h3>
          <ul>{books.map(book => {
            const chosen = active[book.name];
            const conflict = enchantmentConflicts(active, book.name);
            const action = chosen ? labels.remove : conflict.length ? labels.replace : labels.add;
            return <li key={book.name} data-selected={Boolean(chosen)}>
              <img src={bookIcon} alt="" width="28" height="28" />
              <div><strong>{w(book.name)}</strong>{conflict.length > 0 && <small>{labels.swap(conflict.map(name => w(name)).join(', '))}</small>}</div>
              <select aria-label={labels.level + ' · ' + w(book.name)} value={chosen ?? book.maxLevel} disabled={!chosen || book.maxLevel === 1}
                onChange={event => setActive({...active, [book.name]: Number(event.target.value)})}>
                {Array.from({length:book.maxLevel}, (_, i) => <option key={i} value={i+1}>{roman[i+1]}</option>)}
              </select>
              <button type="button" aria-pressed={Boolean(chosen)} aria-label={action + ' ' + w(book.name)} onClick={() => toggle(book)}>{action}</button>
            </li>;
          })}</ul>
        </section>
        <section className={styles.preview} aria-label={labels.preview}>
          <header><h3>{labels.preview}</h3><button type="button" disabled={!Object.keys(active).length} onClick={() => setActive({})}>{labels.clear}</button></header>
          <div className={styles.item} data-image={Boolean(image)}>{image && <img className={styles.visual} src={itemImage} alt="" width="53" height="53"/>}<div><strong>{name}</strong>
            <p>{Object.entries(active).map(([id, level]) => <span key={id}>{w(id)} {roman[level]}</span>)}
              {!Object.keys(active).length && <small>{labels.none}</small>}</p>
          </div></div>
          <table aria-label={labels.compare}>
            <thead><tr><th scope="col">{labels.stat}</th><th scope="col">{labels.base}</th><th scope="col">{labels.estimated}</th></tr></thead>
            <tbody>{rows.map(([label, base, value, effect]) => <tr key={label}><th scope="row">{label}</th><td>{base}</td>
              <td data-changed={Boolean(effect)}>{value}{effect && <small>{effect}</small>}</td></tr>)}</tbody>
          </table>
          {profile.range && <small className={styles.note}>{labels.assumptions}</small>}
          {Object.keys(active).some(book => !['Efficiency','Unbreaking','Mending','Curse of Vanishing'].includes(book))
            && <small className={styles.note}>{labels.conditional}</small>}
        </section>
      </div>
    </section>
  );
}
