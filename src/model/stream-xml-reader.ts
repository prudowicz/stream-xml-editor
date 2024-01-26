import {type ReadStream} from 'fs'

import {type NodeType} from './NodeType'

import { StreamXMLEditor}  from "./stream-xml-editor"


export class StreamXMLReader extends StreamXMLEditor {
    constructor(readStream: ReadStream) {
        super(readStream)

    }

    start() {
        this.readStream.on('readable', () => {
            let chunk;
            while (null !== (chunk = this.readStream.read())) {
                this.saxesParser.write(chunk);
            }
        });

        this.readStream.on('end', () => {
            this.saxesParser.close()
        })
    }

    addReadingRule(path: string, nodeType: NodeType, handler: (content: string) => void)  {
        this.saxesParser.on(nodeType, content => {
            if (this.isInsideNode(path)) {
                return handler(content)
            }
        })
    }
}

