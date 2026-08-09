"""Detect ordered catalog variants such as capsule fill levels."""

from __future__ import annotations

import re
from collections import defaultdict
from typing import Any

TIER_SUFFIX = re.compile(r"^(?P<base>.+)_(?P<tier>\d+|infinite)$", re.IGNORECASE)
TIER_PREFIX = re.compile(
    r"^(?P<namespace>[^:]+:)?(?P<tier>basic|advanced|expert|ultimate|creative|absolute)_(?P<base>.+)$",
    re.IGNORECASE,
)
NAMED_TIER_ORDER = {
    "base": 0,
    "basic": 1,
    "advanced": 2,
    "expert": 3,
    "ultimate": 4,
    "creative": 5,
    "absolute": 6,
}


def _tier_value(value: str) -> tuple[int, int | str]:
    if value.lower() == "infinite":
        return (1, 10_000)
    if value.lower() in NAMED_TIER_ORDER:
        return (0, NAMED_TIER_ORDER[value.lower()])
    return (0, int(value))


def group_variants(entries: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    groups: dict[str, list[tuple[str, dict[str, Any]]]] = defaultdict(list)
    ungrouped_by_identifier: dict[str, dict[str, Any]] = {}

    for entry in entries:
        match = TIER_SUFFIX.match(entry["identifier"])
        prefix_match = TIER_PREFIX.match(entry["identifier"])
        if not match and not prefix_match:
            ungrouped_by_identifier[entry["identifier"]] = entry
            continue
        if match:
            groups[match.group("base")].append((match.group("tier"), entry))
        else:
            base = f"{prefix_match.group('namespace') or ''}{prefix_match.group('base')}"
            groups[base].append((prefix_match.group("tier"), entry))

    for base, candidates in groups.items():
        named_group = any(tier.lower() in NAMED_TIER_ORDER for tier, _ in candidates)
        if named_group and base in ungrouped_by_identifier:
            candidates.append(("base", ungrouped_by_identifier.pop(base)))
        elif not named_group:
            has_first_tier = any(tier == "1" for tier, _ in candidates)
            if not has_first_tier and base in ungrouped_by_identifier:
                candidates.append(("1", ungrouped_by_identifier.pop(base)))

    catalog = list(ungrouped_by_identifier.values())
    variant_groups: list[dict[str, Any]] = []

    for base, candidates in sorted(groups.items()):
        if len(candidates) < 2:
            catalog.extend(entry for _, entry in candidates)
            continue

        ordered = sorted(candidates, key=lambda candidate: _tier_value(candidate[0]))
        variants = [
            {
                "id": entry["id"],
                "identifier": entry["identifier"],
                "name": entry["name"],
                "tier": tier,
                "image": entry.get("image"),
            }
            for tier, entry in ordered
        ]
        first = dict(ordered[0][1])
        first["id"] = base.split(":", 1)[-1]
        first["slug"] = first["id"].replace("_", "-")
        first["identifier"] = base
        first["name"] = re.sub(
            r"^(Basic|Advanced|Expert|Ultimate|Creative|Absolute)\s+|\s+\d+$",
            "",
            first["name"],
            flags=re.IGNORECASE,
        )
        first["variants"] = variants
        catalog.append(first)
        variant_groups.append({
            "id": base.split(":", 1)[-1],
            "identifier": base,
            "variants": variants,
        })

    return sorted(catalog, key=lambda entry: entry["name"].lower()), variant_groups
