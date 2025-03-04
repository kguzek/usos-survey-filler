# USOS Survey Filler

[<img height="12" src="https://flagcdn.com/w80/pl.png" /> Wersja polska](https://github.com/kguzek/usos-survey-filler/blob/main/README-pl.md)

This is an automation tool written using Puppeteer to automatically fill out student surveys on WUST's University Study-Oriented System platform.

It may also work for other Polish universities that use USOS, but has only been tested for the Wrocław University of Science and Technology.

## Usage

Install Node.js and run the following command:

```bash
npx usos-survey-filler
```

## Auto-login

By default, the app asks you for your USOS credentials through the command line. If you omit them, you will have to log in through the Puppeteer browser window.

If you provide the credentials, they will be saved to your machine to the `.env` file, and will be be reused during future runs.

You can skip the credential prompts by specifying the `USOS_USERNAME` and `USOS_PASSWORD` environment variables.

## That's all

If you found this project useful, leave a star! ⭐

If you have any suggestions or bug reports please [open an issue](https://github.com/kguzek/usos-survey-filler/issues/new).

## Copyright

SPDX-License-Identifier: AGPL-3.0-only

USOS Survey Filler

Copyright © 2025 Konrad Guzek

The application is not supported by USOS, the University Centre for Informatization, or the Wrocław University of Science and Technology. All rights, except those for the source code of this program, belong to their respective entities.
