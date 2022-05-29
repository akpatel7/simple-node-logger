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

/**
 *  Stack frames from frontend, must be of the following type: string
 * 
stack: [
    {
      "column":37,
      "fileName":"main-es2015.a31645a9bd075d4753ae.js",
      "line":582,
      "name":"HTMLButtonElement.<anonymous>",
      "source":"webpack:///node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js"
  },
  ...
]

I've used:
https://github.com/stacktracejs/stacktrace.js/ 

FE code:

          // client-side error
          if (error.stack) {
            try {
              await StackTrace.fromError(error).then((stackframes) => {
                stackframes.forEach(sf => {
                  stackFrameDetail.push({
                    name: sf.functionName,
                    args: sf.args,
                    fileName: sf.fileName,
                    line: sf.lineNumber,
                    column: sf.columnNumber,
                    source: sf.source,
                    isEval: sf.isEval,
                    isNative: sf.isNative
                  });
                });
              });
              error.stack = stackFrameDetail.length > 0 ? stackFrameDetail : error.stack;
            }
            catch (err) {
              console.error(err);
            }
          }

          reportObject = {
            name: error.name,
            message: errorMessage || error.message,
            stack: stackFrameDetail.length > 0 ? stackFrameDetail : error.stack,
            url: 'location.href',
            route: 'router.url',
          };
          this.logger.error(reportObject);
        }          


// ref: "https://juanignaciogarzon.medium.com/logging-complete-stacktraces-on-server-without-publishing-javascript-source-code-323e3d4c24ab"