/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testRegex: '(/test/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    }
};