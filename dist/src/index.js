"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const port = Number(process.env.PORT ?? 5001);
app_js_1.app.listen(port, () => {
    console.log(`Harndenomics API listening on port ${port}`);
});
