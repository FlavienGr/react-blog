const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});
afterEach(async () => {
  await page.close();
});
describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login("http://localhost:3000/blogs");
    await page.waitFor("a.btn-floating");
    await page.click("a.btn-floating");
    await page.waitFor("form label");
  });
  it("Can see blog create form", async () => {
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });
  describe("And using invalid input", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    it("the form shows an error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");
      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
  describe("And using valid input", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My title");
      await page.type(".content input", "My content");
      await page.click("form button");
    });
    it("Submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });
    it("Submitting then saving adds blog to inde page", async () => {
      await page.click("button.green");
      await page.waitFor(".card-title");
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");
      expect(title).toEqual("My title");
      expect(content).toEqual("My content");
    });
  });
});
describe("User is not logged in", async () => {
  it("User cannot create blog posts", async () => {
    const result = await page.post("/api/blogs", {
      title: "My Title",
      content: "My content"
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
  it("User cannot get blog posts", async () => {
    const result = await page.get("/api/blogs");
    expect(result).toEqual({ error: "You must log in!" });
  });
});
