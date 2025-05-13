import globals from "globals";

export default [
	{
		files: ["lib/*.js", "test/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node
			}
		}
	}
];
