/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import chalk from "chalk";
import { config } from "dotenv";

config();

async function main() {
  // In order to ensure environment variables are loaded before the module is imported
  const surveyFillerModule = await import("./survey-filler");
  const surveyFiller = new surveyFillerModule.SurveyFiller();
  try {
    await surveyFiller.start();
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    if (
      [
        "Most likely the page has been closed",
        "Navigating frame was detached",
        "(Input.dispatchKeyEvent): Target closed",
      ].find((msg) => error.message.includes(msg))
    ) {
      return;
    } else {
      console.warn(chalk.yellow(error.message));
    }
    process.exitCode = 1;
  }
}

main();
