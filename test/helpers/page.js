const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");
class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }
  constructor(page) {
    this.page = page;
  }
  async login(location) {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto(location || "http://localhost:3000");
    await this.page.waitFor('a[href="/auth/logout"]');
  }
  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
  async get(path) {
    return await this.page.evaluate(_path => {
      return fetch(_path, {
        method: "get",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    }, path);
  }
  async post(path, body) {
    return await this.page.evaluate(
      (_path, _body) => {
        return fetch(_path, {
          method: "post",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(_body)
        }).then(res => res.json());
      },
      path,
      body
    );
  }
}
module.exports = CustomPage;
