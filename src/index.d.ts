import {type ReadStream} from 'fs'
import {type NodeType} from './model/NodeType'

declare module "stream-xml-editor" {
    export class StreamXMLReader {
        constructor(readStream: ReadStream)
        start(): void
        addReadingRulepath(string, nodeType: NodeType, handler: (content: string) => void)
    }
    export class StreamXMLAppender {
        constructor(readStream: ReadStream)
        start(): void
        addAppendingRule(string, nodeType: NodeType, handler: (content: string) => void)
    }
}


