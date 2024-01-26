import {type XMLDocument} from 'libxmljs';
import * as fs from "fs"

import { TSMap } from "typescript-map"
import * as libxml from "libxmljs"
import randomName from 'node-random-name';
import randomTitle from 'random-title'; 
import { LoremIpsum } from "lorem-ipsum";

export const IS_LARGE_MINIMUM = 30

export const mocks_dir = __dirname + "/__mocks/"

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 50,
      min: 30
    }
  });

type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

type BookshelfOption = {
    amount: number
    activeWeekdays: Weekday[]
}

function isWeekday(value: number): value is Weekday {
    return [1, 2, 3, 4, 5, 6, 7].includes(value);
}

export function generateBookshelfXML(options: BookshelfOption[]): XMLDocument {
    const doc = libxml.Document();
    const bookshelf = libxml.Element(doc, "Bookshelf");
    
    for (const o of options) {
        const book = libxml.Element(doc, "Book");
        const author = libxml.Element(doc, "Author", randomName())
        book.addChild(author)

        const title = libxml.Element(doc, "Title", randomTitle({min: 20, max: 100}))
        book.addChild(title)

        const amount = libxml.Element(doc, "Amount", o.amount.toString())
        book.addChild(amount)

        const description = libxml.Element(doc, "Description", lorem.generateSentences(25));
        book.addChild(description)

        const weekdays = new TSMap<string, boolean>()
        for (let i = 1; i <= 7; i++) {
            if (isWeekday(i)) {
                if (o.activeWeekdays.indexOf(i) > -1) {
                    weekdays.set(i.toString(), true)
                }
                else {
                    weekdays.set(i.toString(), false)
                }
            }
        }

        const activeWeekdays = libxml.Element(doc, "ActiveWeekdays")
        activeWeekdays.cdata(JSON.stringify(weekdays))
        book.addChild(activeWeekdays)

        const genre = libxml.Element(doc, "Genre", randomTitle({min: 2, max: 4}))
        const randnum = Math.floor((Math.random() * 100) + 1);
        const list = ["Fiction", "Non-fiction"]
        let cat;
        if (randnum % 2 == 0) {
            cat = list[0]
        }
        else {
            cat = list[1]
        }
        const category = libxml.Element(doc, "Category")
        const type = libxml.Element(doc, "Type", cat)
        category.addChild(type)
        category.addChild(genre)
        book.addChild(category)

        bookshelf.addChild(book);
    }
    

    doc.root(bookshelf)
    return doc
}


function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

// type LargeGenResult = {
//     amountSum: bigint
// }

export function generateLargeBookshelfFile(writeStream: fs.WriteStream, size: number): { amountSum: bigint, isLargeCount: number }  {
    // console.log(size)
    
    const doc = libxml.Document()
    writeStream.write(doc.toString() + "<Bookshelf>\n")

    
    // console.log(xmlstr)
    let actualSize = 0
    let xmlstr = ""
    let sum = BigInt(0)
    let isLargeCount = 0
    
    while (actualSize < size) {
        const name = randomName()
        const random = randomIntFromInterval(20, 50)
        if (random > IS_LARGE_MINIMUM) {
            isLargeCount += 1
        }
        sum = sum + BigInt(random)
        xmlstr = "  <Book>\n    <Author>" + name + "</Author>\n" +
            "    <Title>" + randomTitle({min: 20, max: 100}) + "</Title>\n" +
            "    <Amount>" + random.toString() + "</Amount>\n" + 
            "    <Description>" + lorem.generateSentences(25) + "</Description>\n" +
            `    <ActiveWeekdays><![CDATA[{"1":true,"2":true,"3":true,"4":false,"5":false,"6":false,"7":false}]]></ActiveWeekdays>\n` +
            "  </Book>"

        actualSize += Buffer.byteLength(xmlstr, 'utf8')
        writeStream.write(xmlstr + "\n")
        
    }
    writeStream.write("</Bookshelf>")
    writeStream.close()
    return {
        amountSum: sum,
        isLargeCount: isLargeCount
    }
}