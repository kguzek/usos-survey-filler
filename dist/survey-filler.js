"use strict";
/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyFiller = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const USOS_USERNAME = process.env.USOS_USERNAME || "";
const USOS_PASSWORD = process.env.USOS_PASSWORD || "";
const USOS_HOME_URL = "https://web.usos.pwr.edu.pl/kontroler.php?_action=home/index";
const USOS_LOGIN_URL = "https://login.pwr.edu.pl/auth/realms/pwr.edu.pl/protocol/cas/login?service=https%3A%2F%2Fweb.usos.pwr.edu.pl%2Fkontroler.php%3F_action%3Dlogowaniecas%2Findex";
const USOS_SURVEYS_HOMEPAGE = "https://web.usos.pwr.edu.pl/kontroler.php?_action=dla_stud/studia/ankiety/index";
class SurveyFiller {
    constructor() {
        this.surveys = [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({
                headless: false,
                args: ["--window-size=1600,900", "--window-position=100,100"],
            });
            const pages = yield this.browser.pages();
            yield pages[0].close();
            this.page = yield this.browser.newPage();
            this.page.setViewport({ width: 1600, height: 900 });
        });
    }
    wait() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForNavigation({ waitUntil: "networkidle0" });
        });
    }
    navigate(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(" -->", url);
            yield this.page.goto(url, { waitUntil: "networkidle0" });
        });
    }
    showAlert(message) {
        return this.page.evaluate((message) => alert(`[USOS-Survey-Filler] ${message}`), message);
    }
    manualLogin(alertMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.showAlert(alertMessage);
            while (this.page.url() !== USOS_HOME_URL) {
                yield this.wait();
            }
        });
    }
    automaticLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.click("button.login");
            yield this.wait();
            if (this.page.url() !== USOS_HOME_URL) {
                yield this.manualLogin("Niepoprawne dane loginowe. Proszę zalogować się manualnie.");
            }
        });
    }
    loginToUsos() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.navigate(USOS_LOGIN_URL);
            yield this.page.type("#username", USOS_USERNAME);
            yield this.page.type("#password", USOS_PASSWORD);
            if (USOS_USERNAME === "" || USOS_PASSWORD === "") {
                yield this.manualLogin("Proszę się zalogować manualnie.");
            }
            else {
                yield this.automaticLogin();
            }
        });
    }
    getAllSurveys() {
        return this.page.$$eval("ul.no-bullets.separated li.flex", (surveys) => surveys.map((survey) => {
            var _a, _b;
            const links = survey.querySelectorAll("a");
            const name = (_b = (_a = links[1].textContent) === null || _a === void 0 ? void 0 : _a.trim().replace(/\s+/g, " ")) !== null && _b !== void 0 ? _b : null;
            const link = links[2].getAttribute("href");
            return { name, link };
        }));
    }
    navigateToSurveys() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.navigate(USOS_SURVEYS_HOMEPAGE);
        });
    }
    fillSurvey(survey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (survey == null || survey.link === null) {
                throw new Error("Survey link is null: " + JSON.stringify(survey));
            }
            console.info("Filling out survey for", survey.name);
            yield this.navigate(survey.link);
            //   $('label:contains("68-100")')
            //   .filter((_, l) => $(l).find('input[type="radio"]').length > 0)[0]
            //   .click();
            // $("label:textEquals('tak')").each((_, l) => l.click());
            // $("label:textEquals('raczej się zgadzam')").each((_, l) => l.click());
            yield this.page.$$eval("label", (labels) => {
                labels.forEach((label) => {
                    var _a, _b;
                    const textContent = (_b = (_a = label.textContent) === null || _a === void 0 ? void 0 : _a.trim().replace(/\s+/g, " ")) !== null && _b !== void 0 ? _b : null;
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
            const submitButton = yield this.page.$("input.positive[type=button]");
            if (submitButton == null) {
                throw new Error("Survey submit button not found");
            }
            yield submitButton.click();
            yield this.wait();
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            yield this.loginToUsos();
            this.surveys = yield this.getAllSurveys();
            while (this.surveys.length > 0) {
                yield this.navigateToSurveys();
                const survey = this.surveys.pop();
                if (survey == null) {
                    console.warn("Nullish survey, skipping...");
                    continue;
                }
                yield this.fillSurvey(survey);
            }
            yield this.showAlert("Wszystkie ankiety zostały wypełnione.\nDziękuję za korzystanie z aplikacji!\n\m~ kguzek");
            yield this.browser.close();
        });
    }
}
exports.SurveyFiller = SurveyFiller;
