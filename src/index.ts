/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { config } from "dotenv";

config();

async function main() {
  // In order to ensure environment variables are loaded before the module is imported
  const surveyFillerModule = await import("./survey-filler");
  const surveyFiller = new surveyFillerModule.SurveyFiller();
  surveyFiller.start();
}

main();
