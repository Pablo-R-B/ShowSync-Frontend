/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.

/***************************************************************************************************
 * Fix for CommonJS libraries expecting a Node.js-like global variable.
 */
(window as any).global = window;
