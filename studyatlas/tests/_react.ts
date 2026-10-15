// The Next.js tsconfig keeps JSX for the compiler ("preserve"); tsx needs React in scope to run component files in tests.
import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
