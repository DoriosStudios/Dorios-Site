---
id: utilitycraft-power-network-index
title: Power Network
sidebar_label: Power Network
---

# Power Network

This section covers UtilityCraft blocks that route or relay energy across networks.

# Energy

Every machine in UtilityCraft must be powered somehow to function. That's where the power network comes in. It allows you to connect generators, machines, and energy storage together to create a functioning system.

UtilityCraft uses `DE` (Dorios Energy) as its primary energy type, and all machines and generators are designed to work with it. The power network is responsible for transmitting DE from where it's generated to where it's needed.

The amount of energy a machine can hold is determined by its internal storage capacity and varies for every 1eX tier. These are:
| Short | Math | Amount |
|-------|--------|--------|
| DE | 1 | 1 DE |
| kDE | 1e3 | 1,000 DE |
| MDE | 1e6 | 1,000,000 DE |
| GDE | 1e9 | 1,000,000,000 DE |
| TDE | 1e12 | 1,000,000,000,000 DE |
| PDE | 1e15 | 1,000,000,000,000,000 DE |

- [Transmitters & Receivers](./utilitycraft-transmitters-receivers)
