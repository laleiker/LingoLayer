# Privacy Policy — LingoLayer

**Last updated:** April 3, 2026

## Overview

LingoLayer is a free, open-source Chrome extension that provides interlinear translations from English to Spanish. We are committed to protecting your privacy.

## Data Collection

**LingoLayer does NOT collect, store, or transmit any personal data.**

Specifically, we do NOT collect:
- Personal information (name, email, address)
- Browsing history
- Cookies or tracking identifiers
- Analytics or telemetry data
- Keystroke data

## Data Storage

All user data (translation progress, settings, and gamification state) is stored **locally on your device** using Chrome's `chrome.storage.sync` API. This data stays in your browser and is only synced across your own Chrome profile if you are signed into Chrome.

## Third-Party Services

LingoLayer uses the **Google Translate public API** (`translate.googleapis.com`) to perform translations. When you activate the translation feature:
- The text content of the current webpage is sent to Google's translation servers
- Google's own privacy policy applies to this data processing
- We do not add any identifying information to these requests
- No data is sent until you explicitly activate the translation feature

For more information about Google's data practices, see: [Google Privacy Policy](https://policies.google.com/privacy)

## Permissions

LingoLayer requires the following browser permissions:
- **activeTab**: To access the content of the current tab when you activate translation
- **scripting**: To inject translation content into web pages
- **storage**: To save your settings and progress locally
- **contextMenus**: To provide right-click translation options
- **host_permissions (translate.googleapis.com)**: To communicate with Google Translate API

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last updated" date above and published in our GitHub repository.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository:
https://github.com/laleiker/LingoLayer

## Open Source

LingoLayer is open source under the MIT License. You can review the complete source code at:
https://github.com/laleiker/LingoLayer
