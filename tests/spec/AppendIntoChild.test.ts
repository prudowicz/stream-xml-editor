import * as fs from "fs"
import * as streamPromises from "node:stream/promises"

import {describe, test, expect} from '@jest/globals';
import * as libxml from "libxmljs"

import {StreamXMLAppender } from "../../src/index"
import { generateBookshelfXML } from "../bookshelf";
import { mocks_dir } from '../bookshelf';

describe('Transform test with appending inside child', () => {
  test(`Bookshelf with nodes <Category>Fiction/Non-fiction<Genre> -- </Genre> -
    add to category new node with tag IsAmountEven`, async () => {
    const xml = generateBookshelfXML([
      {amount: 10, activeWeekdays: [3, 7]},
      {amount: 3, activeWeekdays: [1, 2, 3]},
      {amount: 12, activeWeekdays: [1, 5]},
      {amount: 25, activeWeekdays: [1, 3, 4]},
      {amount: 4, activeWeekdays: [1, 2, 3, 4, 5, 6, 7]},
      {amount: 2, activeWeekdays: [7]},
    ]) 

    fs.writeFileSync(mocks_dir + "bookshelf5.xml", xml.toString(), { encoding: 'utf8' } )

    const readable = fs.createReadStream(mocks_dir + "bookshelf5.xml", {
      encoding: 'utf8',
      fd: undefined,
    });
    const writeable = fs.createWriteStream(mocks_dir + "bookshelf5_out.xml")

    const appender = new StreamXMLAppender(readable, writeable)

    appender.addAppendingRule("/Bookshelf/Book/Amount", "text", (content) => {
      const amount = Number.parseInt(content)
      if (amount % 2 == 0) {
          const doc = libxml.Document();
          const newEl = libxml.Element(doc, "IsAmountEven", true.toString())
          return  {
              value: newEl.toString(),
              parentNode: "/Bookshelf/Book/Category",
              isNestedNode: false,
              doIndent: true
          }
      }
      else {
          const doc = libxml.Document();
          const newEl = libxml.Element(doc, "IsAmountEven", false.toString())
          return {
              value: newEl.toString(),
              parentNode: "/Bookshelf/Book/Category",
              isNestedNode: false,
              doIndent: true
          }
      }
    })
    appender.start();
    await streamPromises.finished(readable)
    await streamPromises.finished(writeable)

    const data = fs.readFileSync(mocks_dir + "bookshelf5_out.xml",
            { encoding: 'utf8', flag: 'r' });
    const transformedXml = libxml.parseXml(data)
    const isEven = transformedXml.find("//Bookshelf/Book/Category/IsAmountEven")
    expect(isEven).toHaveLength(6)
    
    expect(isEven[0].child(0)?.text()).toBe(true.toString())
    expect(isEven[1].child(0)?.text()).toBe(false.toString())
    expect(isEven[2].child(0)?.text()).toBe(true.toString())
    expect(isEven[3].child(0)?.text()).toBe(false.toString())
    expect(isEven[4].child(0)?.text()).toBe(true.toString())
    expect(isEven[5].child(0)?.text()).toBe(true.toString())
    expect(isEven[6]).toBe(undefined)

    });

    test(`Bookshelf with nodes <Category>Fiction/Non-fiction<Genre> -- </Genre> -
    add to genre new node with tag IsAmountEven`, async () => {
    const xml = generateBookshelfXML([
      {amount: 10, activeWeekdays: [3, 7]},
      {amount: 3, activeWeekdays: [1, 2, 3]},
      {amount: 12, activeWeekdays: [1, 5]},
      {amount: 30, activeWeekdays: [1, 3, 4]},
      {amount: 21, activeWeekdays: [1, 2, 3, 4, 5, 6, 7]},
      {amount: 2, activeWeekdays: [7]},
    ]) 

    fs.writeFileSync(mocks_dir + "bookshelf6.xml", xml.toString(), { encoding: 'utf8' } )

    const readable = fs.createReadStream(mocks_dir + "bookshelf6.xml", {
      encoding: 'utf8',
      fd: undefined,
    });
    const writeable = fs.createWriteStream(mocks_dir + "bookshelf6_out.xml")

    const appender = new StreamXMLAppender(readable, writeable)

    appender.addAppendingRule("/Bookshelf/Book/Amount", "text", (content) => {
      const amount = Number.parseInt(content)
      if (amount % 2 == 0) {
          const doc = libxml.Document();
          const newEl = libxml.Element(doc, "IsAmountEven", true.toString())
          return  {
              value: newEl.toString(),
              parentNode: "/Bookshelf/Book/Category/Genre",
              isNestedNode: true,
              doIndent: true
          }
      }
      else {
          const doc = libxml.Document();
          const newEl = libxml.Element(doc, "IsAmountEven", false.toString())
          return {
              value: newEl.toString(),
              parentNode: "/Bookshelf/Book/Category/Genre",
              isNestedNode: true,
              doIndent: true
          }
      }
    })
    appender.start();
    await streamPromises.finished(readable)
    await streamPromises.finished(writeable)

    const data = fs.readFileSync(mocks_dir + "bookshelf6_out.xml",
            { encoding: 'utf8', flag: 'r' });
    const transformedXml = libxml.parseXml(data)
    const isEven = transformedXml.find("//Bookshelf/Book/Category/Genre/IsAmountEven")

    // appending to text node without childs is not supported yet
    expect(isEven).toHaveLength(0)

    });
});