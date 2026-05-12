import React from 'react';
import recipeData from './recipeData';
import utilityCraftMachineRecipeData from './utilityCraftMachineRecipeData';

const allRecipeData = {
  ...recipeData,
  ...utilityCraftMachineRecipeData,
};

function humanizeId(id = '') {
  const [, rawId = id] = String(id).split(':');
  const normalized = rawId
    .replace(/waycenter/g, 'way center')
    .replace(/waycarpet/g, 'way carpet')
    .replace(/autofisher/g, 'auto fisher')
    .replace(/autosieve/g, 'auto sieve')
    .replace(/xp/g, 'XP')
    .replace(/_/g, ' ')
    .trim();

  return normalized
    .split(/\s+/)
    .map((part) => part === 'XP' ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeEntry(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.recipes)) return entry.recipes;
  return [entry];
}

function getItemLabel(item) {
  if (item?.label) return item.label;
  if (item?.id) return humanizeId(item.id);
  return 'Unknown item';
}

export default function RecipeIngredientDetails({
  recipeId,
  summary = 'Crafting ingredients in text',
}) {
  const entry = allRecipeData[recipeId];
  if (!entry) return null;

  const recipes = normalizeEntry(entry);

  return (
    <details className="ds-clean">
      <summary><span className="ds-arrow">▸</span> {summary}</summary>

      {entry.note ? <p><strong>Note:</strong> {entry.note}</p> : null}

      {recipes.map((recipe, index) => {
        const title = recipe.title ?? entry.title ?? humanizeId(recipe.resultId);

        return (
          <div key={`${recipe.resultId}-${index}`} style={{ marginTop: index === 0 ? '0.75rem' : '1.1rem' }}>
            {(recipes.length > 1 || recipe.title || entry.title) ? <p><strong>{title}</strong></p> : null}
            {recipe.craftedIn ? <p><strong>Crafted in:</strong> {recipe.craftedIn}</p> : null}
            {recipe.note ? <p><strong>Note:</strong> {recipe.note}</p> : null}
            {recipe.resultId ? <p><strong>Recipe result:</strong> <code>{recipe.resultId}</code></p> : null}
            <p><strong>Total ingredients</strong></p>

            <ul>
              {(recipe.items ?? []).map((item, itemIndex) => (
                <li key={`${item.id ?? title}-${item.amount}-${itemIndex}`}>
                  <strong>{getItemLabel(item)}</strong>
                  {item.id ? <> (<code>{item.id}</code>)</> : null} ×{item.amount}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </details>
  );
}
