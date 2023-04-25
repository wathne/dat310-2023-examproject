const configuration = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => commit.includes('WIP')],
};

module.exports = configuration;
