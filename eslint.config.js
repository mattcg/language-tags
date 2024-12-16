import globals from "globals";

export default [
    {
        files: ["src/*.js", "test/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node
            }
        }
    }
];
