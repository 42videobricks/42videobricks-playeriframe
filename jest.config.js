// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["lcov", "text", "cobertura"],
};