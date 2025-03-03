/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

const USOS_USERNAME = process.env.USOS_USERNAME || "";
const USOS_PASSWORD = process.env.USOS_PASSWORD || "";

const USOS_HOME_URL = "https://web.usos.pwr.edu.pl/kontroler.php?_action=home/index";
const USOS_LOGIN_URL =
  "https://login.pwr.edu.pl/auth/realms/pwr.edu.pl/protocol/cas/login?service=https%3A%2F%2Fweb.usos.pwr.edu.pl%2Fkontroler.php%3F_action%3Dlogowaniecas%2Findex";
const USOS_SURVEYS_HOMEPAGE =
  "https://web.usos.pwr.edu.pl/kontroler.php?_action=dla_stud/studia/ankiety/index";

export class SurveyFiller {
  private page!: Page;
  private browser!: Browser;
  private surveys: SurveyInfo[] = [];

  private async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--window-size=1600,900", "--window-position=100,100"],
    });

    const pages = await this.browser.pages();
    await pages[0].close();
    this.page = await this.browser.newPage();
    this.page.setViewport({ width: 1600, height: 900 });
  }

  private async wait() {
    await this.page.waitForNavigation({ waitUntil: "networkidle0" });
  }

  private async navigate(url: string) {
    console.debug(" -->", url);
    await this.page.goto(url, { waitUntil: "networkidle0" });
  }

  private showAlert(message: string) {
    return this.page.evaluate(
      (message) => alert(`[USOS-Survey-Filler] ${message}`),
      message,
    );
  }

  private async manualLogin(alertMessage: string) {
    await this.showAlert(alertMessage);
    while (this.page.url() !== USOS_HOME_URL) {
      await this.wait();
    }
  }

  private async automaticLogin() {
    await this.page.type("#username", USOS_USERNAME);
    await this.page.type("#password", USOS_PASSWORD);
    await this.page.click("button.login");
    await this.wait();
    if (this.page.url() !== USOS_HOME_URL) {
      await this.manualLogin(
        "Niepoprawne dane loginowe. Proszę zalogować się manualnie.",
      );
    }
  }

  private async loginToUsos() {
    await this.navigate(USOS_LOGIN_URL);
    if (USOS_USERNAME === "" || USOS_PASSWORD === "") {
      await this.manualLogin("Proszę się zalogować do USOSa");
    } else {
      await this.automaticLogin();
    }
  }

  private getAllSurveys(): Promise<SurveyInfo[]> {
    return this.page.$$eval("ul.no-bullets.separated li.flex", (surveys) =>
      surveys.map((survey) => {
        const links = survey.querySelectorAll("a");
        const name = links[1].textContent?.trim().replace(/\s+/g, " ") ?? null;
        const link = links[2].getAttribute("href");
        return { name, link };
      }),
    );
  }

  private async navigateToSurveys() {
    await this.navigate(USOS_SURVEYS_HOMEPAGE);
  }

  private async fillSurvey(survey: SurveyInfo) {
    if (survey.link === null) {
      throw new Error("Survey link is null: " + survey);
    }
    console.info("Filling out survey for", survey.name);
    await this.navigate(survey.link);

    //   $('label:contains("68-100")')
    //   .filter((_, l) => $(l).find('input[type="radio"]').length > 0)[0]
    //   .click();

    // $("label:textEquals('tak')").each((_, l) => l.click());
    // $("label:textEquals('raczej się zgadzam')").each((_, l) => l.click());
    await this.page.$$eval("label", (labels) => {
      labels.forEach((label) => {
        const textContent = label.textContent?.trim().replace(/\s+/g, " ") ?? null;
        if (textContent == null) {
          return;
        }

        const SECTION_ANSWERS = [
          "68-100 %" /** Question 1.1 */,
          "tak" /** Questions 2.1-2.4 */,
          "raczej się zgadzam" /** Questions 3.1-3.6 */,
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

    do {
      await this.navigateToSurveys();
      this.surveys = await this.getAllSurveys();
      await this.fillSurvey(this.surveys[0]);
    } while (this.surveys.length > 0);

    await this.showAlert(
      "Wszystkie ankiety zostały wypełnione.\nDziękuję za korzystanie z aplikacji!\n\m~ kguzek",
    );
    await this.browser.close();
  }
}
