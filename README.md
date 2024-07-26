# create-convex-auth-app

`create-convex-auth-app` is a command-line interface (CLI) tool designed to streamline the process of setting up a new project with Convex and GitHub authentication. This tool automates the initial setup, configuration, and deployment steps, allowing developers to quickly start building their applications.

## Features

- Clones a template repository for Convex with auth setup
- Automatically installs dependencies
- Initializes Convex development environment
- Sets up Convex authentication
- Configures GitHub OAuth credentials
- Provides step-by-step guidance through the setup process

## Prerequisites

Before using this tool, ensure you have the following installed:

- Node.js (version 18 or later)
- npm (usually comes with Node.js)
- Git

## Installation

To install `create-convex-auth-app` globally, run the following command:

```bash
npm install -g create-convex-auth-app
```

## Usage

To create a new Convex project with GitHub authentication, simply run:

```bash
create-convex-auth-app
```

Follow the interactive prompts to:

1. Name your project
2. Set up your Convex development environment
3. Configure GitHub OAuth credentials

## What It Does

When you run `create-convex-auth-app`, it performs the following steps:

1. Clones a template repository
2. Updates the project name in `package.json`
3. Installs npm dependencies
4. Initializes the Convex development environment
5. Sets up Convex authentication
6. Guides you through creating a GitHub OAuth app
7. Configures your Convex environment with GitHub credentials

## Contributing

Contributions to `create-convex-auth-app` are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have any questions, please open an issue in this repository.

---

Happy coding with Convex and GitHub authentication!