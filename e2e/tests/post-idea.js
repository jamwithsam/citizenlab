const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const title = `test idea ${hash}`;

module.exports = {
  '@tags': ['citizen', 'ideas', 'posting'],
  postIdea: (browser) => {
    const signinPage = browser.page.signin();
    const newIdeaPage = browser.page.newIdea();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    newIdeaPage
    .navigate()
    .postIdea(title, 'Lorem ipsum dolor sit amet');

    browser
    .url(`${process.env.ROOT_URL}`)
    .pause(500)
    .waitForElementVisible('#e2e-ideas-list')
    .expect.element('#e2e-ideas-list').text.to.contain(title);

    browser.end();
  },
};
