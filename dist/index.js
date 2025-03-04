var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/tsup/assets/esm_shims.js
var init_esm_shims = __esm({
  "node_modules/tsup/assets/esm_shims.js"() {
    "use strict";
  }
});

// src/survey-filler.ts
var survey_filler_exports = {};
__export(survey_filler_exports, {
  SurveyFiller: () => SurveyFiller
});
import puppeteer from "puppeteer";
var USOS_USERNAME, USOS_PASSWORD, USOS_HOME_URL, USOS_LOGIN_URL, USOS_SURVEYS_HOMEPAGE, SurveyFiller;
var init_survey_filler = __esm({
  "src/survey-filler.ts"() {
    "use strict";
    init_esm_shims();
    USOS_USERNAME = process.env.USOS_USERNAME || "";
    USOS_PASSWORD = process.env.USOS_PASSWORD || "";
    USOS_HOME_URL = "https://web.usos.pwr.edu.pl/kontroler.php?_action=home/index";
    USOS_LOGIN_URL = "https://login.pwr.edu.pl/auth/realms/pwr.edu.pl/protocol/cas/login?service=https%3A%2F%2Fweb.usos.pwr.edu.pl%2Fkontroler.php%3F_action%3Dlogowaniecas%2Findex";
    USOS_SURVEYS_HOMEPAGE = "https://web.usos.pwr.edu.pl/kontroler.php?_action=dla_stud/studia/ankiety/index";
    SurveyFiller = class {
      page;
      browser;
      surveys = [];
      async init() {
        this.browser = await puppeteer.launch({
          headless: false,
          args: ["--window-size=1600,900", "--window-position=100,100"]
        });
        const pages = await this.browser.pages();
        await pages[0].close();
        this.page = await this.browser.newPage();
        this.page.setViewport({ width: 1600, height: 900 });
      }
      async wait() {
        await this.page.waitForNavigation({ waitUntil: "networkidle0" });
      }
      async navigate(url) {
        await this.page.goto(url, { waitUntil: "networkidle0" });
      }
      showAlert(message) {
        return this.page.evaluate(
          (message2) => alert(`[USOS Survey Filler] ${message2}`),
          message
        );
      }
      async manualLogin(alertMessage) {
        await this.showAlert(alertMessage);
        while (this.page.url() !== USOS_HOME_URL) {
          await this.wait();
        }
      }
      async automaticLogin() {
        await this.page.click("button.login");
        await this.wait();
        if (this.page.url() !== USOS_HOME_URL) {
          await this.manualLogin(
            "Niepoprawne dane loginowe. Prosz\u0119 zalogowa\u0107 si\u0119 manualnie."
          );
        }
      }
      async loginToUsos() {
        await this.navigate(USOS_LOGIN_URL);
        const usernameEmpty = USOS_USERNAME === "";
        const passwordEmpty = USOS_PASSWORD === "";
        await this.page.waitForSelector("#username");
        if (!usernameEmpty) {
          await this.page.type("#username", USOS_USERNAME, { delay: 20 });
        }
        if (passwordEmpty) {
          if (!usernameEmpty) {
            await this.page.focus("#password");
          }
        } else {
          await this.page.type("#password", USOS_PASSWORD, { delay: 20 });
        }
        if (usernameEmpty || passwordEmpty) {
          await this.manualLogin("Prosz\u0119 si\u0119 zalogowa\u0107 manualnie.");
        } else {
          await this.automaticLogin();
        }
      }
      getAllSurveys() {
        return this.page.$$eval(
          "ul.no-bullets.separated li.flex",
          (surveys) => surveys.map((survey) => {
            const links = survey.querySelectorAll("a");
            const name = links[1].textContent?.trim().replace(/\s+/g, " ") ?? null;
            const link = links[2].getAttribute("href");
            return { name, link };
          })
        );
      }
      async navigateToSurveys() {
        await this.navigate(USOS_SURVEYS_HOMEPAGE);
      }
      async fillSurvey(survey) {
        if (survey == null || survey.link === null) {
          throw new Error("Survey link is null: " + JSON.stringify(survey));
        }
        console.info("Filling out survey for", survey.name);
        await this.navigate(survey.link);
        await this.page.$$eval("label", (labels) => {
          labels.forEach((label) => {
            const textContent = label.textContent?.trim().replace(/\s+/g, " ") ?? null;
            if (textContent == null) {
              return;
            }
            const SECTION_ANSWERS = [
              "68-100 %",
              "tak",
              "raczej si\u0119 zgadzam"
            ];
            if (SECTION_ANSWERS.includes(textContent)) {
              label.click();
            }
          });
        });
        const submitButton = await this.page.$("input.positive[type=button]");
        if (submitButton == null) {
          throw new Error("Survey submit button not found");
        }
        await submitButton.click();
        await this.wait();
      }
      async start() {
        await this.init();
        await this.loginToUsos();
        this.surveys = await this.getAllSurveys();
        while (this.surveys.length > 0) {
          await this.navigateToSurveys();
          const survey = this.surveys.pop();
          if (survey == null) {
            console.warn("Nullish survey, skipping...");
            continue;
          }
          await this.fillSurvey(survey);
        }
        await this.showAlert(
          "Wszystkie ankiety zosta\u0142y wype\u0142nione.\nDzi\u0119kuj\u0119 za korzystanie z aplikacji!\n\n~ kguzek"
        );
        await this.browser.close();
      }
    };
  }
});

// src/index.ts
init_esm_shims();
import chalk from "chalk";
import { config } from "dotenv";
config();
async function main() {
  const surveyFillerModule = await Promise.resolve().then(() => (init_survey_filler(), survey_filler_exports));
  const surveyFiller = new surveyFillerModule.SurveyFiller();
  try {
    await surveyFiller.start();
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    if ([
      "Most likely the page has been closed",
      "Navigating frame was detached",
      "(Input.dispatchKeyEvent): Target closed"
    ].find((msg) => error.message.includes(msg))) {
      return;
    } else {
      console.warn(chalk.yellow(error.message));
    }
    process.exitCode = 1;
  }
}
main();
//# sourceMappingURL=index.js.map