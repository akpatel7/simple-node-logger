/* tslint:disable */
import fs from 'fs';
import path from 'path';
// import url from 'url';
import sourceMap from 'source-map';

export default class SourceMapper {
    private sourceMapConsumers = {};
    constructor() {
        this.sourceMapConsumers = {};
    }
    async init(sourcesPath) {
        console.log("Initializing sourceMapper");
        fs.readdir(sourcesPath, async (err, items) => {
            if (!items || !items.length) {
                throw new Error("Invalid source path");
            }
            for (const item of items) {
                if (item.endsWith('.js')) {
                    const idx = items.indexOf(item + '.map');
                    if (idx >= 0) {
                        const contents = fs.readFileSync(path.join(sourcesPath, items[idx]), 'utf8');
                        const consumer = await new sourceMap.SourceMapConsumer(contents);
                        this.sourceMapConsumers[item] = consumer;
                        const jdx = items.indexOf(item + '.map');
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
}

// ref: "https://juanignaciogarzon.medium.com/logging-complete-stacktraces-on-server-without-publishing-javascript-source-code-323e3d4c24ab"