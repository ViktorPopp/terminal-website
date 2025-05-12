const terminal = document.querySelector(".terminal");
const promptTemplate = document.getElementById("prompt");
const commandStack = [];

const commands = {
  help: {
    description: "List available commands",
    execute: () => {
      appendResponse("Available commands: help, project, clear");
    },
  },
  project: {
    description: "Show project information. Usage: project hexiumos",
    execute: (args) => {
      if (args.length !== 1 || args[0] !== "hexiumos") {
        appendResponse("Please provide the project name: hexiumos");
        return;
      }
      appendResponse(
        `Project Information for ${args[0]}:` + projects.hexiumos()
      );
    },
  },
  clear: {
    description: "Clear the terminal",
    execute: () => {
      terminal.innerHTML = "";
    },
  },
};

const projects = {
  hexiumos: () => `
- Project Name: Hexium OS
- Author: ViktorPopp
- Description: Lightweight operating system written in Rust.
- URL: <a target="_blank" href="https://github.com/HexiumOS/Hexium">Link to Repo</a>`,
};

function appendResponse(response) {
  const output = document.createElement("div");
  const responseText = document.createElement("pre");
  responseText.innerHTML = response;
  output.appendChild(responseText);
  output.classList.add("output");
  terminal.appendChild(output);
}

function appendInput() {
  const prompt = promptTemplate.content.cloneNode(true);
  const input = prompt.querySelector("input.terminal-input");
  terminal.appendChild(prompt);
  input.focus();

  let currentlyOnStack = commandStack.length;

  input.addEventListener("keydown", (e) => {
    const commandHistoryMovement = (direction) => {
      if (!direction && currentlyOnStack > 0) currentlyOnStack -= 1;
      if (direction && currentlyOnStack < commandStack.length)
        currentlyOnStack += 1;
      input.value = commandStack[currentlyOnStack] || "";
      input.focus();
      input.setSelectionRange(1000, 1000);
    };

    const specialKeys = {
      Enter: () => {
        const value = input.value.trim();
        if (!value) return;
        commandStack.push(value);
        executeCommand(value);
        input.disabled = true;
        appendInput();
      },
      Tab: () => {
        const value = input.value;
        const args = value.split(" ");
        if (args.length === 1) {
          const matchingCommands = Object.keys(commands).filter((c) =>
            c.startsWith(args[0])
          );
          if (matchingCommands.length === 1) {
            input.value = matchingCommands[0];
          }
        } else if (args.length === 2 && args[0] === "project") {
          if ("hexiumos".startsWith(args[1])) {
            input.value = "project hexiumos";
          }
        }
      },
      ArrowUp: () => commandHistoryMovement(false),
      ArrowDown: () => commandHistoryMovement(true),
    };

    if (specialKeys[e.key]) {
      e.preventDefault();
      specialKeys[e.key]();
    }
  });
}

function executeCommand(input) {
  const [command, ...args] = input.split(" ");
  if (commands[command]) {
    commands[command].execute(args);
  } else {
    appendResponse(`Invalid Command: ${input}`);
  }
}

document.body.addEventListener("click", () => {
  const input = document.querySelector("input.terminal-input:not([disabled])");
  if (input) input.focus();
});

appendInput();
