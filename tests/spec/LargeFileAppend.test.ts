import * as fs from "fs"
import * as streamPromises from "node:stream/promises"

import {describe, expect, test} from '@jest/globals';
import byteSize from "byte-size"

import {StreamXMLAppender } from "../../src/index"

import { generateLargeBookshelfFile, IS_LARGE_MINIMUM } from "../bookshelf";
import { mocks_dir } from "../bookshelf";

describe("Testing streamble functions with 20M file",() => {
    test('Append node to 200MB file', async () => {
        const size = 30 * 1024 * 1024
        const filePath = mocks_dir + "largeb1.xml"

        console.log(`creating ${byteSize(size)} new file ${filePath}`)

        const writeStream = fs.createWriteStream(filePath)
        const res = generateLargeBookshelfFile(writeStream, size)
        
        await streamPromises.finished(writeStream)
        try {
            console.log("amountSum: ", res.amountSum.toString())
            console.log("isLargeCount", res.isLargeCount)
            let mySum = BigInt(0)
            let largeTrue = 0
            let largeFalse = 0

            const readStream = fs.createReadStream(filePath)
            const transformed = fs.createWriteStream(filePath + ".out")
            const reader = new StreamXMLAppender(readStream, transformed)
            reader.addAppendingRule(
                "/Bookshelf/Book/Amount",
                "text",
                (content) => {
                    const am = BigInt(content)
                    mySum = mySum + am
                    if (am > IS_LARGE_MINIMUM) {
                        largeTrue = largeTrue + 1
                        return {
                            value: `<IsLargeAmount>${true.toString()}</IsLargeAmount>`,
                            parentNode: "/Bookshelf/Book",
                            doIndent: true
                        }
                    }
                    else {
                        largeFalse = largeFalse + 1
                        return {
                            value: `<IsLargeAmount>${false.toString()}</IsLargeAmount>`,
                            parentNode: "/Bookshelf/Book",
                            doIndent: true
                        }
                    }
                }
            )
            reader.start()
            await streamPromises.finished(readStream)
            console.log("mySum: ", mySum.toString())
            console.log("largeTrue: ", largeTrue.toString(), "largeFalse: ", largeFalse.toString())

            expect(mySum).toBe(res.amountSum)
            expect(largeTrue).toBe(res.isLargeCount)
        }
        catch (error) {
            console.log(error)
            throw error
        }
    }, 1200000)
})