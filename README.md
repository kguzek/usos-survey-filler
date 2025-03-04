# USOS Survey Filler

<img height="12" src="https://flagcdn.com/w80/pl.png" alt="PL" /> [Wersja polska](https://github.com/kguzek/usos-survey-filler/blob/main/README-pl.md)

This is an automation tool written using Puppeteer to automatically fill out student surveys on WUST's University Study-Oriented System platform.

It may also work for other Polish universities that use USOS, but has only been tested for the Wrocław University of Science and Technology.

## Usage

[Install Node.js](https://nodejs.org/en/) and run the following command:

```bash
npx usos-survey-filler
```

## Auto-login

By default, the app asks you for your USOS credentials through the command line. If you omit them, you will have to log in through the Puppeteer browser window.

If you provide the credentials, they will be saved to your machine to the `.env` file, and will be be reused during future runs.

You can skip the credential prompts by specifying the `USOS_USERNAME` and `USOS_PASSWORD` environment variables.

## FAQ

1. 🥶 The browser doesn't start! (Usually on GNU/Linux)
   - Try using the headless switch (--headless or -l)

2. 😕 It says it filled out 0 surveys...
   - Try not using the auto-detected system browser (input N at the prompt)

3. ❓ How does it answer the surveys?
   - The program selects random answers with predetermined weights, such that it prefers (in order) slightly positive answers, then neutral, then very positive and lastly negative answers. Most questions will be answered relatively positively (i.e. "mostly agree").

## That's all

If you found this project useful, [leave a star](https://github.com/kguzek/usos-survey-filler)! ⭐

If you have any suggestions, feedback or bug reports please [open an issue](https://github.com/kguzek/usos-survey-filler/issues/new).

## Copyright

SPDX-License-Identifier: AGPL-3.0-only

USOS Survey Filler

Copyright © 2025 Konrad Guzek

The application is neither supported nor endorsed by USOS, the University Centre for Informatization, or the Wrocław University of Science and Technology. All rights, except those for the source code of this program, belong to their respective entities.
