const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});
afterEach(async () => {
  await page.close();
});

test("header has the correct title", async () => {
  const title = await page.getContentsOf("a.brand-logo");
  expect(title).toBe("Blogster");
});
test("clicking login ", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});
test("When signed in, shows logout button", async () => {
  await page.login();
  const test = await page.getContentsOf('a[href="/auth/logout"]');

  expect(test).toMatch("Logout");
});
