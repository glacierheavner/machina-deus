const defaults = require("./defaults");

module.exports = {
    async validateSubcommands(client, message, data) {
        const input = message.content.split(" ");
        let validSubcommands = [];
        let validSubcommandNames = [];

        data.subcommands.forEach((subcommand) => {
            let arguments = [];
            subcommand.arguments.forEach((argument) => {
                if (argument.required) {
                    arguments.push(`<${argument.name}>`);
                }
                else {
                    arguments.push(`[${argument.name}]`);
                }
            });

            validSubcommands.push(`**${client.config.prefix}${data.name} ${subcommand.name}** ${arguments.join(" ")} - ${subcommand.description}`);
            validSubcommandNames.push(subcommand.name);
        });

        // If they didnt give a subcommand
        if (input.length < 2) {
            const embed = defaults.createErrorEmbed("400", "You must include a subcommand.", "subcommand", validSubcommands);
            message.reply({ embeds: [embed] });
            return false;
        }

        const subcommand = input[1];

        // If they gave an invalid subcommand
        if (!validSubcommandNames.includes(subcommand)) {
            const embed = defaults.createErrorEmbed("400", "You must include a valid subcommand.", "subcommand", validSubcommands);
            message.reply({ embeds: [embed] });
            return false;
        }

        return true;
    },

    async validateCommand(client, message, data) {
        const input = message.content.split(" ");

        // !create channel blargh
        // 1       2       3
        // 0       1       2
        
        let subcommand = false;
        let validArgumentStrings = [];
        let validArgumentNames = [];
        let validArgumentText = [];

        let valid = true;
        let errorMessage = "";
        let validOptionsType = "";
        let validOptions = null;

        // For each argument in the command
        data.arguments.forEach((argmuent, index) => {
            // If the argument is a subcommand
            if (argument.name === "subcommand") {
                subcommand = true;

                let validSubcommandStrings = [];
                let validSubcommandNames = [];

                // Iterate through all valid subcommands
                argument.subcommands.forEach((subcommand) => {
                    // Iterate through all of the subcommands arguments
                    subcommand.arguments.forEach((subcommandArgument) => {
                        // Add the argument to the help array
                        if (subcommandArgument.required) {
                            validArgumentStrings.push(`<${subcommandArgument.name}>`);
                        }
                        else {
                            validArgumentStrings.push(`[${subcommandArgument.name}]`);
                        }

                        // Add the argument to the name array
                        validArgumentNames.push(subcommandArgument.name);
                        validArgumentText.push(`${subcommandArgument.name} (${subcommandArgument.required ? "required" : "not required"})`);
                    });
                    
                    // Add the subcommand help string and name
                    validSubcommandStrings.push(`**${client.config.prefix}${data.name} ${subcommand.name}**`);
                    validSubcommandNames.push(subcommand.name);
                });

                break;
            }

            // If the argument is... an argument
            if (argument.required) {
                validArgumentStrings.push(`<${argument.name}>`);
            }
            else {
                validArgumentStrings.push(`[${argument.name}]`);
            }

            validArgumentNames.push(argument.name);

            // Validate the argument
            if (argument.required) {
                if (index >= input.length) {
                    valid = false;
                    errorMessage = `You must include the \`${argument.name}\` argument.`;
                    break;
                }
            }

            // Validate argument types
            if (argument.type === "string") {
                continue;
            }
            else if (argument.type === "int") {
                if (Number(input[index + 1]) === NaN) {
                    valid = false;
                    errorMessage = `The \`${argument.name}\` argument must be an integer.`;
                    break;
                }
            }
            else if (argument.type === "url") {
                if (!input[index + 1].startsWith("http")) {
                    valid = false;
                    errorMessage = `The \`${argument.name}\` argument must be a URL.`;
                    break;
                }
            }
            else if (argument.type === "hex") {
                let color;
                if (input[index + 1].startsWith("#")) {
                    color = input[index + 1].substring(1);
                }
                else {
                    color = input[index + 1];
                }

                if (!(color.length === 6 && !isNaN(Number("0x" + color)))) {
                    valid = false;
                    errorMessage = `The \`${argument.name}\` argument must be a hex color code.`;
                    break;
                }
            }
        });

        // --- Subcommand Validation --- //
        // If the command requires a subcommand and the user didnt give one
        if (input.length === 1 && subcommand) {
            valid = false;
            errorMessage = "You must include a subcommand.";
            validOptionsType = "subcommand";
            validOptions = validSubcommandStrings;
        }

        // If the user gave an invalid subcommand
        if ((!validSubcommandNames.includes(input[1])) && subcommand) {
            valid = false;
            errorMessage = "You must include a valid subcommand.";
            validOptionsType = "subcommand";
            validOptions = validSubcommandStrings;
        }

        // If the user gave a valid subcommand but no arguments
        if (input.length === 2 && subcommand) {
            valid = false;
            errorMessage = "You must include arguments for the subcommand.";
            validOptions = "arguments";
            validOptions = validArgumentText;
        }

        // --- Argument Validation --- //
        // If the command requires arguments but the user gave none

        // If the user gave some required arguments, but not all

        // If the user gave all required arguments, but incorrect types

        
        // If the command is invalid, give an error and return false
        if (!valid) {
            const embed = defaults.createErrorEmbed("400", errorMessage, validOptionsType, validOptions);
            message.reply({ embeds: [embed] });
            return false;
        }

        // Otherwise (command is valid) return true
        return true;
    }
};