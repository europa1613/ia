// https://github.com/TopCli/Spinner

import * as timers from "node:timers/promises";
import { Spinner } from "@topcli/spinner";

async function fnWithSpinner(withPrefix, succeed = true) {
    const spinner = new Spinner().start("Start working!", { withPrefix });

    await timers.setTimeout(1000);
    spinner.text = "Work in progress...";
    await timers.setTimeout(1000);

    if (succeed) {
        spinner.succeed(`All done in ${spinner.elapsedTime.toFixed(2)}ms !`);
    } else {
        spinner.failed("Something wrong happened !");
    }
}

await Promise.allSettled([
    fnWithSpinner(),
    fnWithSpinner("Item 1"),
    fnWithSpinner("Item 2", false),
]);
Spinner.reset(); // reset internal count
console.log("All spinners finished!");