'use strict';
const vm = require('vm');
const gameSrc = "const Game = (function(){ return {a:1}; })();";
const context = vm.createContext({ console });
const wrapped = 'var Game = (function() {\n' + gameSrc + '\nreturn Game;\n})();';
vm.runInNewContext(wrapped, context);
console.log('Game:', context.Game);
