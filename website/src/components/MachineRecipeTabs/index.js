import React, { useMemo, useState } from 'react';
import styles from './styles.module.css';

const FIELD_ORDER = [
  ['input', 'Input'],
  ['catalysts', 'Catalysts'],
  ['fluid', 'Fluid'],
  ['output', 'Output'],
  ['byproduct', 'Byproduct'],
  ['cost', 'Cost'],
  ['speed', 'Speed'],
];

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function renderStack(value) {
  return toArray(value).map((entry, index) => (
    <span key={`${entry}-${index}`}>{entry}</span>
  ));
}

function joinValue(value) {
  return toArray(value).join('; ');
}

function getVariantRank(label = '') {
  const normalized = label.toLowerCase();
  if (normalized.includes('standard')) return 0;
  if (normalized.includes('cheapest')) return 1;
  if (normalized.includes('alternative')) return 2;
  return 3;
}

export default function MachineRecipeTabs({
  recipes = [],
  accentColor = '#ff6b00',
  fieldColors = {},
  note,
  footerNote,
  defaultMode = 'table',
}) {
  const [mode, setMode] = useState(defaultMode);

  const groups = useMemo(() => {
    const map = new Map();
    for (const recipe of recipes) {
      const key = recipe.groupId ?? recipe.outputKey ?? joinValue(recipe.output);
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: recipe.groupTitle ?? joinValue(recipe.output),
          hint: recipe.groupHint,
          recipes: [],
        });
      }
      map.get(key).recipes.push(recipe);
    }

    return [...map.values()].map((group) => ({
      ...group,
      recipes: [...group.recipes].sort((left, right) => getVariantRank(left.variantLabel) - getVariantRank(right.variantLabel)),
    }));
  }, [recipes]);

  const style = {
    '--rt-accent': accentColor,
    '--rt-input': fieldColors.input ?? '#f4b15c',
    '--rt-catalysts': fieldColors.catalysts ?? '#c67cff',
    '--rt-fluid': fieldColors.fluid ?? '#56b8ff',
    '--rt-output': fieldColors.output ?? '#58d68d',
    '--rt-byproduct': fieldColors.byproduct ?? '#8f9bb3',
    '--rt-cost': fieldColors.cost ?? '#ff8b5f',
    '--rt-speed': fieldColors.speed ?? '#ff6fd8',
  };

  return (
    <div className={styles.wrap} style={style}>
      {note ? <p className={styles.note}>{note}</p> : null}

      <div className={styles.tabList} role="tablist" aria-label="Recipe display mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'table'}
          className={`${styles.tabButton} ${mode === 'table' ? styles.tabButtonActive : ''}`}
          onClick={() => setMode('table')}
        >
          Table
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'list'}
          className={`${styles.tabButton} ${mode === 'list' ? styles.tabButtonActive : ''}`}
          onClick={() => setMode('list')}
        >
          List
        </button>
      </div>

      {mode === 'table' ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {FIELD_ORDER.map(([key, label]) => (
                  <th key={key} className={styles.tableHead} data-kind={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  {FIELD_ORDER.map(([key]) => (
                    <td key={`${recipe.id}-${key}`} className={styles.tableCell}>
                      <div className={styles.cellStack}>{renderStack(recipe[key] ?? '—')}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <section key={group.key} className={styles.group}>
              <div className={styles.groupTitleRow}>
                <h4 className={styles.groupTitle}>{group.title}</h4>
                {group.hint ? <span className={styles.groupHint}>{group.hint}</span> : null}
              </div>

              {group.recipes.map((recipe) => (
                <div key={recipe.id} className={styles.recipeCard}>
                  {recipe.variantLabel || recipe.variantNote ? (
                    <div className={styles.variantRow}>
                      {recipe.variantLabel ? <span className={styles.variantBadge}>{recipe.variantLabel}</span> : null}
                      {recipe.variantNote ? <span className={styles.variantNote}>{recipe.variantNote}</span> : null}
                    </div>
                  ) : null}

                  <div className={styles.lineList}>
                    {FIELD_ORDER.map(([key, label]) => {
                      const value = recipe[key];
                      if (!value) return null;
                      return (
                        <div key={`${recipe.id}-${key}`} className={styles.line}>
                          <span className={styles.lineDash}>-</span>
                          <span className={styles.fieldTag} data-kind={key}>{label}</span>
                          <span className={styles.lineValue}>{joinValue(value)}</span>
                        </div>
                      );
                    })}

                    {recipe.note ? (
                      <div className={styles.line}>
                        <span className={styles.lineDash}>-</span>
                        <span className={styles.fieldTag} data-kind="note">Note</span>
                        <span className={styles.lineValue}>{recipe.note}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {footerNote ? <p className={styles.footerNote}>{footerNote}</p> : null}
    </div>
  );
}
