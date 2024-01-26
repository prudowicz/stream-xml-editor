import * as fs from "fs"
import * as streamPromises from "node:stream/promises"

import {describe, expect, test} from '@jest/globals';

import {StreamXMLReader } from "../../src/index"

import { generateBookshelfXML } from "../bookshelf";
import { mocks_dir } from "../bookshelf";

describe('Test for streaming xml read of text node value', () => {
    test('Summing amount of books in bookshelf', async () => {
        // checkMocksDirExist()

        const xml = generateBookshelfXML([
            {amount: 10, activeWeekdays: [3, 7]},
            {amount: 6, activeWeekdays: [1, 2, 3]},
            {amount: 12, activeWeekdays: [1, 5]},
            {amount: 25, activeWeekdays: [1, 5]}
        ]) // sum is 53

        fs.writeFileSync(mocks_dir + "bookshelf1.xml", xml.toString(), { encoding: 'utf8' } )
        const readable = fs.createReadStream(mocks_dir + "bookshelf1.xml", {
            encoding: 'utf8',
            fd: undefined,
        });

        const reader = new StreamXMLReader(readable)
        let sum = 0
        reader.addReadingRule("/Bookshelf/Book/Amount", "text", (content) => {
            const amount = Number.parseInt(content)
            sum += amount
        })
        reader.start();
        await streamPromises.finished(readable)

        expect(sum).toBe(53);
    })
    
});