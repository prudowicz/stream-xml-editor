import { type SaxesParser } from "saxes"
import {type ReadStream} from 'fs'

import * as saxes from "saxes"

export abstract class StreamXMLEditor {
    readStream: ReadStream
    saxesParser: SaxesParser
    abstract start(): void

    constructor(readStream: ReadStream) {
        this.readStream = readStream
        this.saxesParser = new saxes.SaxesParser({fragment: true})

        this.saxesParser.on('error', error => {
            console.log('!error', error)
        });
    }


    isInsideNode(path: string) {
        if (path[0] != "/") {
            throw new Error("Path has to be started with /")
        }
        if (path[path.length - 1] == "/") {
            throw new Error("Path cannot be ended with /")
        }
        const arrayPath = path.split("/")
        arrayPath.shift()
        const names: string[] = []
        for (const tag of this.saxesParser['tags']) {
            names.push(tag.name)
        }
        if (names.length != arrayPath.length) {
            return false;
        }
        if (JSON.stringify(names) != JSON.stringify(arrayPath)) {
            return false;
        }
        return true;
    }
}

// export = StreamXMLEditor;