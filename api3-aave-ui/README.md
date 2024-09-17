[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

# API3 Aave UI

This repository is being used in [Aave Protocol V2 Fork](https://github.com/api3-ecosystem/aave-protocol-v2-fork) to spin up market frontend. follow the docs the in [Aave Protocol V2 Fork](https://github.com/api3-ecosystem/aave-protocol-v2-fork) to run frontend on custom networks

## What is Aave?

Aave is a decentralized non-custodial liquidity markets protocol where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn a passive income, while borrowers are able to borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.

## What is API3

API3 is a collaborative project to deliver traditional API services to smart contract platforms in a decentralized and trust-minimized way.

API3 is building secure first-party oracles and OEV-enabled data feeds for DeFi protocols and users. The data feeds are continuously updated by first-party oracles using signed data.

## Setup

The repository uses `deployment-configs.json` to load market configs. By default it uses default configs, and it uses defined configs if started from [Aave Protocol V2 Fork](https://github.com/api3-ecosystem/aave-protocol-v2-fork).

### Spinning up the frontend locally with defaults

- Install dependencies`

  ```bash
  yarn
  ```

- Start next client

  ```bash
  yarn dev
  ```
