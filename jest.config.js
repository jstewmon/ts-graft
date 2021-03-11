module.exports = {
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  collectCoverage: true,
  preset: "ts-jest",
  roots: ["src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["\\.d\\.ts$"],
  verbose: true,
};
