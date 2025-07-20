module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["js", "ts", "json", "node"],
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  transformIgnorePatterns: ["/node_modules/"],
  globals: {
    "ts-jest": { isolatedModules: true },
  },
};
