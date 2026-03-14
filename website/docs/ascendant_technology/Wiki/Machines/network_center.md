---
id: network_center
title: Network Center
sidebar_label: Network Center
---

![Network Center Render](/img/addons/ascendant/network_center.png)

The **Network Center** scans your connected DE network and shows a full monitoring summary in real time.

> [!NOTE]
> The UI is not final and may change in future updates.

---

## Machine Information

| Setting | Value |
|----------|--------|
| **Energy Capacity** | 800,000 DE |
| **Energy Consumption** | 400 DE per scan cycle |
| **Base Processing Rate** | 8,000 DE/t |
| **Scan Interval** | ~2 seconds |
| **Network Safety Limit** | 4096 nodes |
| **Upgrade Slots** | None |

---

## Machine UI

> UI screenshot is not available yet in the docs assets.

---

## Usage Examples

| Setup | Result |
|-------|--------|
| Connected mid-size network | Live overview of production/consumption |
| High-capacity factory grid | Stored energy, free space, and status indicators |
| Large network near 4096 nodes | Truncation/performance warning visibility |

---

## Crafting Recipe

> Crafting recipe image is not available yet in the docs assets.

---

## How It Works

1. Place and connect the machine to your energy grid.
2. Keep DE available for periodic scanning.
3. Open the interface to inspect generation, consumption, and network status.

---

## Panel Data

- Machine and generator counts
- Battery and cable counts
- Stored energy, total capacity, and free space
- Net energy flow and overall status (Stable, Charging, Draining, Deficit, Buffer Full)

---

## Performance Notes

- The scanner consumes energy continuously while active.
- Very large networks can trigger safety truncation warnings.

