/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

const USOS_HOME_URL = "https://web.usos.pwr.edu.pl/kontroler.php?_action=home/index";
const USOS_LOGIN_URL =
  "https://login.pwr.edu.pl/auth/realms/pwr.edu.pl/protocol/cas/login?service=https%3A%2F%2Fweb.usos.pwr.edu.pl%2Fkontroler.php%3F_action%3Dlogowaniecas%2Findex";
const USOS_SURVEYS_HOMEPAGE =
  "https://web.usos.pwr.edu.pl/kontroler.php?_action=dla_stud/studia/ankiety/index";

interface SurveyInfo {
  name: string | null;
  link: string | null;
}

export class SurveyFiller {
  private page!: Page;
  private browser!: Browser;
  private surveys: SurveyInfo[] = [];
  private usosUsername: string;
  private usosPassword: string;
  private headless: boolean;
  private surveysFilled = 0;
  private browserPath?: string;
  private randomAnswers: boolean;

  constructor(
    username?: string,
    password?: string,
    headless = false,
    browserPath?: string,
    randomAnswers = false,
  ) {
    this.usosUsername = username || "";
    this.usosPassword = password || "";
    this.headless = headless;
    if (headless && (this.usosUsername === "" || this.usosPassword === "")) {
      throw new Error("Tryb headless wymaga podania loginu i hasła.");
    }
    this.browserPath = browserPath;
    this.randomAnswers = randomAnswers;
  }

  getSurveysFilled() {
    return this.surveysFilled;
  }

  private async init() {
    this.browser = await puppeteer.launch({
      headless: this.headless ? undefined : false,
      args: ["--window-size=1600,900", "--window-position=100,100"],
      executablePath: this.browserPath,
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
    // console.debug(" -->", url);
    await this.page.goto(url, { waitUntil: "networkidle0" });
  }

  private showAlert(message: string) {
    if (this.headless) {
      return;
    }
    return this.page.evaluate(
      (message) => alert(`[USOS Survey Filler] ${message}`),
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
    const usernameEmpty = this.usosUsername === "";
    const passwordEmpty = this.usosPassword === "";
    await this.page.waitForSelector("#username");
    if (!usernameEmpty) {
      await this.page.type("#username", this.usosUsername, { delay: 40 });
    }
    if (passwordEmpty) {
      if (!usernameEmpty) {
        await this.page.focus("#password");
      }
    } else {
      await this.page.type("#password", this.usosPassword, { delay: 40 });
    }

    if (usernameEmpty || passwordEmpty) {
      await this.manualLogin("Proszę się zalogować manualnie.");
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

  private async fillSurvey(survey?: SurveyInfo) {
    if (survey == null || survey.link === null) {
      throw new Error("Survey link is null: " + JSON.stringify(survey));
    }
    console.info("Filling out survey for", survey.name);
    await this.navigate(survey.link);

    //   $('label:contains("68-100")')
    //   .filter((_, l) => $(l).find('input[type="radio"]').length > 0)[0]
    //   .click();

    // $("label:textEquals('tak')").each((_, l) => l.click());
    // $("label:textEquals('raczej się zgadzam')").each((_, l) => l.click());
    await this.page.$$eval("label", (labels) => {
      const percentageAnswers = [
        "0-33 %",
        "34-67 %",
        "34-67 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
      ];
      const yesNoAnswers = ["nie", "tak", "tak", "tak", "tak", "tak", "tak"];
      const subjectiveAnswers = [
        "zdecydowanie się nie zgadzam",
        "raczej się nie zgadzam",
        "zdecydowanie się zgadzam",
        "zdecydowanie się zgadzam",
        "nie mam zdania",
        "nie mam zdania",
        "nie mam zdania",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
        "raczej się zgadzam",
      ];
      const getRandomItem = <T>(array: T[]) =>
        this.randomAnswers
          ? array[Math.floor(Math.random() * array.length)]
          : array.at(-1);

      labels.forEach((label) => {
        const textContent = label.textContent?.trim().replace(/\s+/g, " ") ?? null;
        if (textContent == null) {
          return;
        }

        const SECTION_ANSWERS = [
          getRandomItem(percentageAnswers) /** Question 1.1 */,
          getRandomItem(yesNoAnswers) /** Questions 2.1-2.4 */,
          getRandomItem(subjectiveAnswers) /** Questions 3.1-3.6 */,
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
    this.surveysFilled++;
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
      "Wszystkie ankiety zostały wypełnione.\nDziękuję za korzystanie z aplikacji!\n\n~ kguzek",
    );
    await this.browser.close();
  }
}
