import {type ReadStream, WriteStream} from 'fs'

import {type NodeType} from './NodeType'

import { StreamXMLEditor } from "./stream-xml-editor"

type AppendTask = {
    value: string
    parentNode: string
    doIndent: boolean
}

export class StreamXMLAppender extends StreamXMLEditor {
    writeStream: WriteStream
    tasks: AppendTask[]

    constructor(readStream: ReadStream, writeStream: WriteStream) {
        super(readStream)
        this.writeStream = writeStream
        this.tasks = []

        this.saxesParser.on('closetag', () => {
            if (this.tasks.length > 0) {
                if (this.tasks[0].parentNode.length > 0 && this.isInsideNode(this.tasks[0].parentNode)) {
                    const task = this.tasks.shift()
                    if (task && task.value.length > 0) {
                        let indents = ""
                        if (task.doIndent) {
                            indents = "\n"
                            const indents_number = this.saxesParser['tags'].length
                            for (let it = 0; it < indents_number; it++) {
                                indents = indents + "\t"
                            }
                        }
                        this.writeStream.write(indents + task.value)
                    }
                }
            }

            
        })
    }

    start() {
        this.readStream.on('readable', () => {
            let chunk;
            while (null !== (chunk = this.readStream.read(1))) {
                this.writeStream.write(chunk)
                this.saxesParser.write(chunk);
            }
        });

        this.readStream.on('end', () => {
            this.saxesParser.close()
            this.writeStream.close()
        })
    }

    addAppendingRule(pathToRead: string, nodeType: NodeType, handler: (content: string) => AppendTask)  {
        this.saxesParser.on(nodeType, content => {
            if (this.isInsideNode(pathToRead)) {
                const task = handler(content)
                this.tasks.push(task)
            }
        })
    }
}