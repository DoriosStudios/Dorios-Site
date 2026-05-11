import React from 'react';
import recipeData from './recipeData';

export default function RecipeIngredientDetails({
  recipeId,
  summary = 'Crafting ingredients in text',
}) {
  const recipe = recipeData[recipeId];
  if (!recipe) return null;

  return (
    <details className="ds-clean">
      <summary><span className="ds-arrow">▸</span> {summary}</summary>

      <p><strong>Recipe result:</strong> <code>{recipe.resultId}</code></p>
      <p><strong>Total ingredients</strong></p>

      <ul>
        {recipe.items.map((item) => (
          <li key={`${item.id}-${item.amount}`}>
            <strong>{item.label}</strong> (<code>{item.id}</code>) ×{item.amount}
          </li>
        ))}
      </ul>
    </details>
  );
}
