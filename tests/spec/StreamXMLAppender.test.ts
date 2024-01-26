import * as fs from "fs"
import * as streamPromises from "node:stream/promises"

import * as libxml from "libxmljs"
import {describe, expect, test} from '@jest/globals';

import {StreamXMLAppender } from "../../src/index"

import { generateBookshelfXML } from "../bookshelf";
import { weekdayFromNumber } from "../weekday"
import { mocks_dir } from "../bookshelf";

describe('Test for streaming xml append node with text', () => {
    test('Add text node IsLargeAmount', async () => {
        // checkMocksDirExist()

        const xml = generateBookshelfXML([
            {amount: 10, activeWeekdays: [3, 7]},
            {amount: 3, activeWeekdays: [1, 2, 3]},
            {amount: 12, activeWeekdays: [1, 5]},
            {amount: 25, activeWeekdays: [1, 3, 4]},
            {amount: 4, activeWeekdays: [1, 2, 3, 4, 5, 6, 7]},
            {amount: 2, activeWeekdays: [7]},
        ]) // sum is 56
        const sum = 56
        const sum10Percent = sum / 10

        fs.writeFileSync(mocks_dir + "bookshelf2.xml", xml.toString(), { encoding: 'utf8' } )
        const readable = fs.createReadStream(mocks_dir + "bookshelf2.xml", {
            encoding: 'utf8',
            fd: undefined,
        });
        const writeable = fs.createWriteStream(mocks_dir + "bookshelf2_out.xml")

        const appender = new StreamXMLAppender(readable, writeable)
        appender.addAppendingRule("/Bookshelf/Book/Amount", "text", (content) => {
            const amount = Number.parseInt(content)
            if (amount > sum10Percent) {
                const doc = libxml.Document();
                const newEl = libxml.Element(doc, "IsLargeAmount", true.toString())
                return  {
                    value: newEl.toString(),
                    parentNode: "/Bookshelf/Book",
                    doIndent: true
                }
            }
            else {
                const doc = libxml.Document();
                const newEl = libxml.Element(doc, "IsLargeAmount", false.toString())
                return {
                    value: newEl.toString(),
                    parentNode: "/Bookshelf/Book",
                    doIndent: true
                }
            }
        })
        appender.start();
        await streamPromises.finished(readable)
        await streamPromises.finished(writeable)

        // tests for checking if appends in correct place
        const data = fs.readFileSync(mocks_dir + "bookshelf2_out.xml",
            { encoding: 'utf8', flag: 'r' });
        const transformedXml = libxml.parseXml(data)
        const isLarge = transformedXml.find("//Bookshelf/Book/IsLargeAmount")
        expect(isLarge).toHaveLength(6)
        
        expect(isLarge[0].child(0)?.text()).toBe(true.toString())
        expect(isLarge[1].child(0)?.text()).toBe(false.toString())
        expect(isLarge[2].child(0)?.text()).toBe(true.toString())
        expect(isLarge[3].child(0)?.text()).toBe(true.toString())
        expect(isLarge[4].child(0)?.text()).toBe(false.toString())
        expect(isLarge[5].child(0)?.text()).toBe(false.toString())
        expect(isLarge[6]).toBe(undefined)


    })
})

describe('Append node only when true', () => {
    test('Add text node IsLargeAmount when true', async () => {
        const xml = generateBookshelfXML([
            {amount: 10, activeWeekdays: [3, 7]},
            {amount: 3, activeWeekdays: [1, 2, 3]},
            {amount: 12, activeWeekdays: [1, 5]},
            {amount: 25, activeWeekdays: [1, 3, 4]},
            {amount: 4, activeWeekdays: [1, 2, 3, 4, 5, 6, 7]},
            {amount: 2, activeWeekdays: [7]},
        ]) // sum is 56
        const sum = 56
        const sum10Percent = sum / 10

        fs.writeFileSync(mocks_dir + "bookshelf3.xml", xml.toString(), { encoding: 'utf8' } )
        const readable = fs.createReadStream(mocks_dir + "bookshelf3.xml", {
            encoding: 'utf8',
            fd: undefined,
        });
        const writeable = fs.createWriteStream(mocks_dir + "bookshelf3_out.xml")

        const appender = new StreamXMLAppender(readable, writeable)
        appender.addAppendingRule("/Bookshelf/Book/Amount", "text", (content) => {
            const amount = Number.parseInt(content)
            if (amount > sum10Percent) {
                const doc = libxml.Document();
                const newEl = libxml.Element(doc, "IsLargeAmount", true.toString())
                return  {
                    value: newEl.toString(),
                    parentNode: "/Bookshelf/Book",
                    doIndent: true
                }
            }
            else {
                return {
                    value: "",
                    parentNode: "/Bookshelf/Book",
                    doIndent: false
                }
            }
        })
        appender.start();
        await streamPromises.finished(readable)
        await streamPromises.finished(writeable)

        const data = fs.readFileSync(mocks_dir + "bookshelf3_out.xml",
            { encoding: 'utf8', flag: 'r' });
        const transformedXml = libxml.parseXml(data)
        const isLarge = transformedXml.find("//Bookshelf/Book/IsLargeAmount")
        expect(isLarge).toHaveLength(3)

        const books = transformedXml.find("//Bookshelf/Book")
        expect(books).toHaveLength(6)

        expect(books[0].find("IsLargeAmount")[0].child(0)?.text()).toBe(true.toString())
        expect(books[1].find("IsLargeAmount")).toHaveLength(0)
        expect(books[2].find("IsLargeAmount")[0].child(0)?.text()).toBe(true.toString())
        expect(books[3].find("IsLargeAmount")[0].child(0)?.text()).toBe(true.toString())
        expect(books[4].find("IsLargeAmount")).toHaveLength(0)
        expect(books[5].find("IsLargeAmount")).toHaveLength(0)
        expect(books[6]).toBe(undefined)

        
    })
})

// test transforming cdata to text node

describe("Transform cdata to new text node",() => {
    test('Add new node Weekdays with comma-separated Weekday as string', async () => {
        const xml = generateBookshelfXML([
            {amount: 10, activeWeekdays: [3, 7]},
            {amount: 3, activeWeekdays: [1, 2, 3]},
            {amount: 12, activeWeekdays: [1, 5]},
            {amount: 25, activeWeekdays: [1, 3, 4]},
            {amount: 4, activeWeekdays: [1, 2, 3, 4, 5, 6, 7]},
            {amount: 2, activeWeekdays: [7]},
            {amount: 2, activeWeekdays: []},
        ]) 

        fs.writeFileSync(mocks_dir + "bookshelf4.xml", xml.toString(), { encoding: 'utf8' } )
        const readable = fs.createReadStream(mocks_dir + "bookshelf4.xml", {
            encoding: 'utf8',
            fd: undefined,
        });
        const writeable = fs.createWriteStream(mocks_dir + "bookshelf4_out.xml")

        const appender = new StreamXMLAppender(readable, writeable)

        appender.addAppendingRule("/Bookshelf/Book/ActiveWeekdays", "cdata", (content) => {
            const activeWeekdays = JSON.parse(content)
            const keys = Object.keys(activeWeekdays) as Array<keyof typeof activeWeekdays>;
            let weekdaysStr = ""
            keys.forEach((key) => {
                const weekday = weekdayFromNumber(Number.parseInt(key as string))
                if (activeWeekdays[key]) {
                    weekdaysStr += weekday + ","
                }
            });
            weekdaysStr = weekdaysStr.slice(0, weekdaysStr.length - 1)
            const doc = libxml.Document()
            const newEl = libxml.Element(doc, "Weekdays", weekdaysStr)
            return {
                value: newEl.toString(),
                parentNode: "/Bookshelf/Book",
                doIndent: true
            }
        })
        appender.start()

        await streamPromises.finished(readable)
        await streamPromises.finished(writeable)

        const data = fs.readFileSync(mocks_dir + "bookshelf4_out.xml",
            { encoding: 'utf8', flag: 'r' });
        const transformedXml = libxml.parseXml(data)
        const elWeekdays = transformedXml.find("//Bookshelf/Book/Weekdays")

        expect(elWeekdays).toHaveLength(7)
        
        expect(elWeekdays[0].child(0)?.text()).toBe("Wednesday,Sunday")
        expect(elWeekdays[1].child(0)?.text()).toBe("Monday,Tuesday,Wednesday")
        expect(elWeekdays[2].child(0)?.text()).toBe("Monday,Friday")
        expect(elWeekdays[3].child(0)?.text()).toBe("Monday,Wednesday,Thursday")
        expect(elWeekdays[4].child(0)?.text()).toBe("Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday")
        expect(elWeekdays[5].child(0)?.text()).toBe("Sunday")
        expect(elWeekdays[6].child(0)?.text()).toBe(undefined)
    })
})