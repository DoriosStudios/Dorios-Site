import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  IconAdjustmentsHorizontal, IconBrush, IconCheck, IconCube, IconHammer, IconHandStop,
  IconLayersSubtract, IconLayoutGrid, IconLeaf, IconMountain, IconPalette, IconRectangleVertical,
  IconScissors, IconSearch, IconSquare, IconStairs, IconTools, IconTrees, IconWall, IconX,
} from '@tabler/icons-react';
import {applyPreset, CATEGORIES, defaultSelection, familyCategory, familySelection,
  fullBlockSelection, nameOf, PRESETS, selectedRecords, selectionKey, SHAPES, toggle} from './selection.mjs';
import styles from './styles.module.css';
import BlockPreview, {representativeBlock} from './BlockPreview';

const categoryIcons = {all: IconLayoutGrid, stone: IconMountain, wood: IconTrees,
  colored: IconPalette, nature: IconLeaf, tools: IconTools};
const presetIcons = {everything: IconLayoutGrid, full_blocks: IconCube, tools_only: IconTools,
  wood_only: IconTrees, stone_only: IconMountain, colored_only: IconPalette};
const shapeIcons = {block: IconCube, slab: IconLayersSubtract, stairs: IconStairs,
  vertical_slab: IconRectangleVertical, wall: IconWall, carpet: IconSquare};
const toolIcons = {chisel: IconHammer, gloves: IconHandStop, glass_cutter: IconScissors,
  furniture_hammer: IconTools, painting: IconBrush};
const nativeSwatches = {none: '#c8d8da', white: '#f0f0f0', orange: '#f9801d', magenta: '#c74ebd',
  light_blue: '#3ab3da', yellow: '#fed83d', lime: '#80c71f', pink: '#f38baa', gray: '#474f52',
  light_gray: '#9d9d97', cyan: '#169c9c', purple: '#8932b8', blue: '#3c44aa', brown: '#835432',
  green: '#5e7c16', red: '#b02e26', black: '#1d1d21'};
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Check({mixed = false, ...props}) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <input ref={ref} type="checkbox" {...props} />;
}

function OptionGroup({title, values, options, enabled, onToggle, onAll, onNone, t, shapes = false}) {
  const id = useId();
  const illustrated = options.some(option => option.record?.preview);
  return <section className={styles.optionGroup} aria-labelledby={id}>
    <div className={styles.groupHeading}>
      <h4 id={id}>{title}<span>{enabled ? options.filter(option => values.includes(option.id)).length : 0} / {options.length}</span></h4>
      <div className={styles.smallActions}>
        <button type="button" onClick={onAll}>{t('groupAll')}</button>
        <button type="button" onClick={onNone}>{t('groupNone')}</button>
      </div>
    </div>
    <div className={shapes ? styles.shapeGrid : illustrated ? styles.imageChoices : styles.choices}>
      {options.map(option => {
        const checked = enabled && values.includes(option.id);
        const Icon = shapeIcons[option.id];
        return <label key={option.id} className={shapes ? styles.shapeChoice : styles.optionChoice} data-checked={checked} data-preview={Boolean(option.record?.preview)}>
          <input className={styles.optionInput} type="checkbox" checked={checked} onChange={() => onToggle(option.id)} />
          {option.record?.preview ? <BlockPreview record={option.record} className={styles.blockPreview} />
            : shapes && Icon ? <Icon className={styles.shapeIcon} size={26} stroke={1.5} aria-hidden="true" />
            : option.hex ? <i className={styles.colorSwatch} style={{backgroundColor: option.hex}} aria-hidden="true" />
              : <span className={styles.checkMark} aria-hidden="true">{checked && <IconCheck size={12} stroke={2.5} />}</span>}
          <span>{option.label}</span>
          {!shapes && (option.hex || illustrated) && <span className={styles.colorCheck} aria-hidden="true">{checked && <IconCheck size={12} stroke={2.5} />}</span>}
          {shapes && <span className={styles.shapeCheck} aria-hidden="true">{checked && <IconCheck size={12} stroke={2.5} />}</span>}
        </label>;
      })}
    </div>
  </section>;
}

export default function BuilderControls({catalog, selection, onChange, busy, locale, formatNumber, t}) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('andesite');
  const records = useMemo(() => selectedRecords(catalog, selection), [catalog, selection]);
  const familyRecords = useMemo(() => Object.fromEntries(catalog.families.map(family =>
    [family.id, catalog.records.filter(record => record.kind === 'block' && record.family === family.id)])), [catalog]);
  const previewFor = (id, required = {}) => representativeBlock(familyRecords[id], {
    variant: selection.families[id]?.variants[0], color: selection.families[id]?.colors[0],
  }, required);
  const counts = useMemo(() => {
    const result = {};
    records.forEach(record => { if (record.family) result[record.family] = (result[record.family] ?? 0) + 1; });
    return result;
  }, [records]);
  const presets = useMemo(() => PRESETS.map(id => {
    const value = applyPreset(catalog, id);
    const entries = selectedRecords(catalog, value);
    return {id, value, key: selectionKey(catalog, value), blocks: entries.filter(record => record.kind === 'block').length,
      items: entries.filter(record => record.kind === 'tool').length};
  }), [catalog]);
  const currentKey = useMemo(() => selectionKey(catalog, selection), [catalog, selection]);
  const activePreset = presets.find(preset => preset.key === currentKey)?.id;
  const visible = useMemo(() => catalog.families
    .filter(family => (category === 'all' || familyCategory(family) === category)
      && normalize(nameOf(family, locale)).includes(normalize(query.trim())))
    .sort((a, b) => nameOf(a, locale).localeCompare(nameOf(b, locale), locale)), [catalog, category, query, locale]);
  const family = visible.find(value => value.id === activeId) ?? visible[0];
  const options = family && selection.families[family.id];
  const updateFamily = (id, patch) => onChange(previous => ({...previous,
    families: {...previous.families, [id]: {...previous.families[id], ...patch}}}));
  const toggleFamily = (family, enabled) => {
    const previous = selection.families[family.id];
    const complete = familySelection(family);
    updateFamily(family.id, {enabled,
      ...Object.fromEntries(['variants', 'shapes', 'colors'].map(key => [key, previous[key].length ? previous[key] : complete[key]]))});
  };
  const changeOption = (key, value) => updateFamily(family.id, {enabled: true,
    [key]: options.enabled ? toggle(options[key], value) : [value]});
  const choosePreset = preset => {
    onChange(preset.value);
    setQuery('');
    const scope = {wood_only: 'wood', stone_only: 'stone', colored_only: 'colored', tools_only: 'tools'}[preset.id] ?? 'all';
    setCategory(scope);
    const first = catalog.families.find(family => preset.value.families[family.id].enabled
      && (scope === 'all' || familyCategory(family) === scope));
    if (first) setActiveId(first.id);
  };
  const familyIconCategory = family && familyCategory(family);
  const MaterialIcon = categoryIcons[familyIconCategory] ?? IconCube;
  const setTools = tools => onChange(previous => ({...previous, tools}));

  return <fieldset disabled={busy} className={styles.controls}>
    <div className={styles.sectionHeading}>
      <div><p className={styles.eyebrow}>{t('startWithPreset')}</p><h3>{t('presets')}</h3></div>
      <button type="button" className={styles.textButton} onClick={() => onChange(defaultSelection(catalog, false))}><IconX size={16} aria-hidden="true" />{t('none')}</button>
    </div>
    <p className={styles.sectionHint}>{t('presetHint')}</p>
    <div className={styles.presetGrid} aria-label={t('presets')}>
      {presets.map(preset => {
        const Icon = presetIcons[preset.id];
        return <button key={preset.id} type="button" className={styles.presetCard} aria-pressed={activePreset === preset.id}
          onClick={() => choosePreset(preset)}>
          <span className={styles.presetIcon}><Icon size={23} stroke={1.6} aria-hidden="true" /></span>
          <span className={styles.presetCopy}><strong>{t(`preset_${preset.id}`)}</strong><span>{t(`preset_${preset.id}_hint`)}</span>
            <small>{t('presetCount', {blocks: formatNumber(preset.blocks), items: formatNumber(preset.items)})}</small></span>
          <span className={styles.presetCheck} aria-hidden="true">{activePreset === preset.id && <IconCheck size={15} stroke={2.3} />}</span>
        </button>;
      })}
    </div>

    <div className={styles.sectionHeading}>
      <div><p className={styles.eyebrow}>{t('makeItYours')}</p><h3>{t('customize')}</h3></div>
      <span className={styles.selectionMode}><IconAdjustmentsHorizontal size={15} aria-hidden="true" />{activePreset ? t(`preset_${activePreset}`) : t('customSelection')}</span>
    </div>
    <div className={styles.categories} role="group" aria-label={t('categories')}>
      {CATEGORIES.map(id => {
        const Icon = categoryIcons[id];
        const count = id === 'tools' ? catalog.tools.length : catalog.families.filter(family => id === 'all' || familyCategory(family) === id).length;
        if (!count) return null;
        return <button type="button" key={id} aria-pressed={category === id} onClick={() => {setCategory(id); setQuery('');}}>
          <Icon size={17} stroke={1.7} aria-hidden="true" />{t(`category_${id}`)}<span>{formatNumber(count)}</span>
        </button>;
      })}
    </div>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        {category === 'tools' ? <div className={styles.toolsIntro}><IconTools size={36} stroke={1.2} aria-hidden="true" />
          <h4>{t('tools')}</h4><p>{t('toolHint')}</p>
          <div className={styles.smallActions}><button type="button" onClick={() => setTools(catalog.tools.map(tool => tool.id))}>{t('groupAll')}</button>
            <button type="button" onClick={() => setTools([])}>{t('groupNone')}</button></div>
        </div> : <>
          <label className={styles.search}><IconSearch size={17} aria-hidden="true" /><input type="search" aria-label={t('search')}
            placeholder={t('search')} value={query} onChange={event => setQuery(event.target.value)} /></label>
          <p className={styles.listHint}>{t('familyHint')}</p>
          <div className={styles.familyList} aria-label={t('blocks')}>
            {visible.map(entry => {
              const count = counts[entry.id] ?? 0;
              const total = familyRecords[entry.id].length;
              const Icon = categoryIcons[familyCategory(entry)];
              return <div className={styles.familyRow} data-active={family?.id === entry.id} key={entry.id}>
                <Check aria-label={t('selectFamily', {family: nameOf(entry, locale)})} checked={count > 0} mixed={count > 0 && count < total}
                  onChange={event => toggleFamily(entry, event.target.checked)} />
                <button type="button" onClick={() => setActiveId(entry.id)} aria-pressed={family?.id === entry.id}>
                  <span className={styles.materialIcon} data-material={familyCategory(entry)}>{previewFor(entry.id)?.preview
                    ? <BlockPreview record={previewFor(entry.id)} className={styles.blockPreview} />
                    : <Icon size={20} stroke={1.6} aria-hidden="true" />}</span>
                  <span className={styles.familyName}>{nameOf(entry, locale)}<small>{formatNumber(count)} / {formatNumber(total)}</small></span>
                </button>
              </div>;
            })}
            {!visible.length && <p className={styles.noMatch}>{t('noMatch')}</p>}
          </div>
        </>}
      </aside>
      <div className={styles.editor}>
        {category === 'tools' ? <>
          <div className={styles.editorHeading}><div><p className={styles.eyebrow}>{t('equipment')}</p><h3>{t('tools')}</h3></div>
            <span className={styles.countBadge}>{selection.tools.length} / {catalog.tools.length}</span></div>
          <div className={styles.toolGrid}>{catalog.tools.map(tool => {
            const Icon = toolIcons[tool.id] ?? IconTools;
            const count = catalog.records.filter(record => record.kind === 'tool' && record.tool === tool.id).length;
            const checked = selection.tools.includes(tool.id);
            return <label className={styles.toolCard} key={tool.id} data-checked={checked}>
              <input className={styles.optionInput} type="checkbox" checked={checked} onChange={() => setTools(toggle(selection.tools, tool.id))} />
              <Icon size={27} stroke={1.5} aria-hidden="true" /><span><strong>{nameOf(tool, locale)}</strong>
                <span>{t(`tool_${tool.id}_hint`)}</span><small>{t('itemCount', {count: formatNumber(count)})}</small></span>
              <span className={styles.checkMark} aria-hidden="true">{checked && <IconCheck size={13} stroke={2.3} />}</span>
            </label>;
          })}</div>
        </> : family ? <>
          <div className={styles.editorHeading}>
            <div className={styles.materialTitle}><span className={styles.materialHero} data-material={familyIconCategory}>{previewFor(family.id)?.preview
              ? <BlockPreview record={previewFor(family.id)} className={styles.blockPreview} />
              : <MaterialIcon size={29} stroke={1.4} aria-hidden="true" />}</span>
              <div><p className={styles.eyebrow}>{t(`category_${familyIconCategory}`)}</p><h3>{nameOf(family, locale)}</h3></div></div>
            <label className={styles.includeFamily}><Check checked={options.enabled && (counts[family.id] ?? 0) > 0}
              onChange={event => toggleFamily(family, event.target.checked)} />{t('includeFamily')}</label>
          </div>
          <p className={styles.editorHint}>{t('familyCount', {count: formatNumber(counts[family.id] ?? 0), total: formatNumber(familyRecords[family.id].length)})}</p>
          <div className={styles.familyActions}>
            <button type="button" onClick={() => updateFamily(family.id, familySelection(family))}>{t('familyAll')}</button>
            {family.shapes.includes('block') && <button type="button" onClick={() => updateFamily(family.id, fullBlockSelection(catalog, family))}><IconCube size={15} aria-hidden="true" />{t('full')}</button>}
            <button type="button" onClick={() => updateFamily(family.id, {enabled: false})}>{t('familyNone')}</button>
          </div>
          <OptionGroup title={t('shapes')} options={SHAPES.filter(shape => family.shapes.includes(shape)).map(id => ({id, label: t(id), record: previewFor(family.id, {shape: id})}))}
            values={options.shapes} enabled={options.enabled} shapes t={t} onToggle={id => changeOption('shapes', id)}
            onAll={() => updateFamily(family.id, {enabled: true, shapes: [...family.shapes]})} onNone={() => updateFamily(family.id, {shapes: []})} />
          {family.variants.length > 1 && <OptionGroup title={t('variants')}
            options={family.variants.map(value => ({id: value.id, label: nameOf(value, locale), record: previewFor(family.id, {variant: value.id})}))} values={options.variants} enabled={options.enabled} t={t}
            onToggle={id => changeOption('variants', id)} onAll={() => updateFamily(family.id, {enabled: true, variants: family.variants.map(value => value.id)})}
            onNone={() => updateFamily(family.id, {variants: []})} />}
          {family.colors.length > 1 && <OptionGroup title={t('colors')}
            options={family.colors.map(value => ({id: value.id, label: nameOf(value, locale), hex: value.hex ?? nativeSwatches[value.id], record: previewFor(family.id, {color: value.id})}))} values={options.colors} enabled={options.enabled} t={t}
            onToggle={id => changeOption('colors', id)} onAll={() => updateFamily(family.id, {enabled: true, colors: family.colors.map(value => value.id)})}
            onNone={() => updateFamily(family.id, {colors: []})} />}
        </> : <div className={styles.editorEmpty}><IconSearch size={32} aria-hidden="true" /><p>{t('noMatch')}</p></div>}
      </div>
    </div>
  </fieldset>;
}
