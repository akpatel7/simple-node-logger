/* tslint:disable */
import fs from 'fs';
import path from 'path';
import sourceMap from 'source-map';

export default class SourceMapper {
    sourceMapConsumers: {};

    constructor() {
      this.sourceMapConsumers = {};
    }

    public async init(sourcesPath) {
        console.log("Initializing sourceMapper");
        fs.readdir(sourcesPath, async (err, items) => {
            if (!items || !items.length) {
                throw new Error("Invalid source path");
            }
            for (var item of items) {
                if (item.endsWith('.js')) {
                    var idx = items.indexOf(item + '.map');
                    if (idx >= 0) {
                        const contents = fs.readFileSync(path.join(sourcesPath, items[idx]), 'utf8');
                        const consumer = await new sourceMap.SourceMapConsumer(contents);
                        this.sourceMapConsumers[item] = consumer;
                        var idx = items.indexOf(item + '.map');
                        if (idx >= 0) {
                            const contents = fs.readFileSync(path.join(sourcesPath, items[idx]), 'utf8');
                            const consumer = await new sourceMap.SourceMapConsumer(contents);
                            this.sourceMapConsumers[item] = consumer;
                        }
                    }
                }
            }
        });
    }

    public async getOriginalStacktrace (stack) {
        // map stack to individual stack frames
        return Promise.all(stack.map(stackframe => this._originalPositionFor(stackframe, this.sourceMapConsumers)));
    }

    private async _originalPositionFor (stackframe, sourceMapConsumers) {
        return new Promise(async (resolve, reject) => {
            try {
                const originalstackFrame = Object.assign({}, stackframe);
                // strip url from filename, to match source map consumer keys (the filenames)
                originalstackFrame.fileName = stackframe?.fileName?.substring(stackframe.fileName?.lastIndexOf('/')+1);
                // use mathcing source map if found to get orignal source code location
                const { column, line, source } = await sourceMapConsumers?.[originalstackFrame?.fileName]?.originalPositionFor(originalstackFrame);
                // replace column, line, source in stack frame
                Object.assign(originalstackFrame, { column, line, source });
                // return stack frame with original source file location
                resolve(originalstackFrame);
            } 
            catch (err) {
                // any error return raw stack frame
                resolve(stackframe);
            }
        });
    }
}

// ref: "https://juanignaciogarzon.medium.com/logging-complete-stacktraces-on-server-without-publishing-javascript-source-code-323e3d4c24ab"