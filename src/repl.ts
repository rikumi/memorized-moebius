import vm from 'vm';
import repl from 'repl';
import createMoebius from './index';

console.log('You\'re now in a sandbox where `m` is a memorized moebius object.');

const context = vm.createContext({ m: createMoebius() });

repl.start({
  prompt: '\nmemorized-moebius > ',
  eval: (cmd, ctx, file, cb) => {
    try {
      const result = vm.runInContext(cmd, context);
      cb(null, result);
    } catch (e) {
      cb(e, undefined);
    }
  },
});
