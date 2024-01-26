import * as fs from "fs"

import { mocks_dir } from "./bookshelf";

beforeAll(() => {
    if (fs.existsSync(mocks_dir)) {
        console.log('Recreating mocks directory');
        fs.rmSync(mocks_dir, { recursive: true })
        fs.mkdirSync(mocks_dir)
    } else {
        console.log('The directory does NOT exist');
        fs.mkdirSync(mocks_dir)
    }
})

describe('To do test', () => {
    test.todo('Mock todo');
});