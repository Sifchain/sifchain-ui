module.exports = {
  name: "unit",
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.ts"],
  coveragePathIgnorePatterns: ["<rootDir>/src/generated/"],
};
