MinerVsEverything — static GitHub Pages site
===========================================

What this is
------------
A simple responsive static site showcasing three "absurd" random-event computations (UUID collision, two shuffled decks matching, and randomly typing the Lorem Ipsum paragraph). Each computation is compared to the per-block chance of a miner with configurable hash rate (default 1 TH/s) relative to a network hash rate (default 400 EH/s).

Files
-----
- index.html — main page
- styles.css — styling and responsive layout
- script.js — client-side computations and animations
- assets/ — put your images here:
  - assets/dp.svg  (channel display picture)
  - assets/banner.svg (channel banner)

How to deploy on GitHub Pages
----------------------------
1. Create (or choose) a repository under your account.
2. Copy these files to the repository root (or a docs/ folder).
3. Add your images to assets/ as dp.svg and banner.svg (this repo already contains the banner and DP).
4. In repository Settings → Pages, set source to the branch and folder (root or /docs) where index.html is located.
5. Visit the published URL (usually https://<username>.github.io/<repo>/).

Satirical visitor counter
-------------------------
The current visitor counter is a satirical random estimate (displayed as "..., probably"). We can replace this with a global counter later via a serverless function or third-party analytics if you want.

Notes & customization
---------------------
- The miner/network assumptions are editable on the page. The miner hash rate control defaults to 1 TH/s and the network to 400 EH/s (changeable).
- All computations are client-side and use log-space arithmetic where needed to represent astronomically small probabilities without underflow.
- Colors are chosen to match the banner/DP aesthetic (teal / purple / orange).

License & credits
-----------------
Copyright © 2026 ManVsEverything
This static site is provided as-is for the MinerVsEverything channel.
