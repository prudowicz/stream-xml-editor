# stream-xml-editor
```console
npm install stream-xml-editor
```
##
This library helps you to transform large XML files (2G+) using streams, therefore 
you can read values or append new node to file which does not fit in your memory. 
It uses [saxes](https://github.com/lddubeau/saxes) library under the hood.

##
Text node values and cdata are both supported

# Use cases
## 
- Read value
```js
import * as streamPromises from "node:stream/promises"

import { StreamXMLReader } from "stream-xml-editor"

/* Lets assume our xml has structure: 
<Root>
  <Entity>
    <Name>name1</Name>
    <Value>5</Value>
  </Entity>
  <Entity>
    <Name>name2</Name>
    <Value>8</Value>
  </Entity>
</Root> */

async function main() {
    const readable = getYourReadStream()
    const reader = new StreamXMLReader(readable)
    let sum = 0
    reader.addReadingRule("/Root/Entity/Value", "text", (content) => {
        const amount = Number.parseInt(content)
        sum += amount
    })
    reader.start(); // do not forget to start your reader
    await streamPromises.finished(readable) // sum should be 13
}
```

- Append new node
```js
import * as streamPromises from "node:stream/promises"

import { StreamXMLAppender } from "stream-xml-editor"

async function main() {
    const readable = getYourReadStream() // same structure with Entity Value tags
    const writable = getYourWriteStream()
    const appender = new StreamXMLAppender(readable, writeable)
    let sum = 0
    appender.addAppendingRule("/Root/Entity/Value", "text", (content) => {
        const amount = Number.parseInt(content)
        if (amount % 2 == 0) {
            return  {
                value: "<IsEven>true</IsEven>",
                parentNode: "/Root/Entity",
                doIndent: true
            }
        }
        else {
            return  {
                value: "<IsEven>false</IsEven>",
                parentNode: "/Root/Entity",
                doIndent: true
            }
        }
    })
    reader.start(); // do not forget to start your reader
    await streamPromises.finished(readable)
    await streamPromises.finished(writable) // new file will have nodes appended

}
```

# Development and contribution
To do:
- [ ] Modify (overwrite) content of node
- [ ] Remove given node from xml file

##
Contributions in form of new Pull Requests are more than welcome.
##
Clone this repository and install deps with
```console
npm install
```
##
Run tests with
```console
npm test
```