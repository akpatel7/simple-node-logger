/* tslint:disable */
import fs from 'fs';
import path from 'path';
// import url from 'url';
import sourceMap from 'source-map';

export default class SourceMapper {
    sourceMapConsumers: {};
    constructor() {
      this.sourceMapConsumers = {};
    }
    async init(sourcesPath) {
        console.log("Initializing sourceMapper");
        fs.readdir(sourcesPath, async (err, items) => {
            console.log("🚀 ~ file: sourceMapper.ts ~ line 15 ~ SourceMapper ~ fs.readdir ~ items", items);
            if (!items || !items.length) {
            throw new Error("Invalid source path");
            }
            for (var item of items) {
                if (item.endsWith('.js')) {
                    var idx = items.indexOf(item + '.map');
                    if (idx >= 0) {
                        console.log('OUTER path.join(sourcesPath, items[idx]', path.join(sourcesPath, items[idx]));
                        const contents = fs.readFileSync(path.join(sourcesPath, items[idx]), 'utf8');
                        const consumer = await new sourceMap.SourceMapConsumer(contents);
                        this.sourceMapConsumers[item] = consumer;
                        var idx = items.indexOf(item + '.map');
                        if (idx >= 0) {
                            console.log('INNER path.join(sourcesPath, items[idx]', path.join(sourcesPath, items[idx]));
                            const contents = fs.readFileSync(path.join(sourcesPath, items[idx]), 'utf8');
                            const consumer = await new sourceMap.SourceMapConsumer(contents);
                            this.sourceMapConsumers[item] = consumer;
                        }
                    }
                }
            }
            console.log("🚀 ~ file: sourceMapper.ts ~ line 37 ~ SourceMapper ~ init ~ sourceMapConsumers", this.sourceMapConsumers);
        });
    }
}

// ref: "https://juanignaciogarzon.medium.com/logging-complete-stacktraces-on-server-without-publishing-javascript-source-code-323e3d4c24ab"