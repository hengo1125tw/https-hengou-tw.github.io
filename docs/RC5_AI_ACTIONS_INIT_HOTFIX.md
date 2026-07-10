# v1.2.0-rc.5 AI Actions Init Hotfix

## Problem

On GitHub Pages, AI Actions can still appear unresponsive even after browser bundling.

Likely cause:
- cached module script,
- module initialization timing,
- button event listeners not attaching.

## Fix

- Loads `admin-ai-actions.js` as a normal script instead of `type="module"`.
- Adds `?v=rc5` cache busting to the script tag.
- Adds immediate initialization if DOMContentLoaded already fired.
- Adds delegated click fallback on `document`.
- Keeps direct button event listeners.
- Adds `window.HGAiActionsReady` and `HGRunAiActionTest()`.

## No Apps Script redeployment required.

Only GitHub files need to be updated.
