# File Master Agent

**File Master Agent** is an intelligent assistant designed to streamline file and folder management on your computer through natural language commands. It leverages the power of the Goose AI framework and LangGraph Swarm to understand complex requests and execute them efficiently.

## Overview

In today's digital world, managing a vast number of files and folders can be time-consuming and cumbersome. File Master Agent aims to simplify this by providing a conversational interface to your file system. You can instruct the agent to perform a wide range of operations, from simple file creation and deletion to more complex tasks like organizing directories, searching for files based on content, and batch operations.

## Key Features

*   **Natural Language Understanding:** Interact with your file system using everyday language.
*   **Comprehensive File Operations:** Supports creating, reading, updating, deleting, moving, copying, and renaming files and folders.
*   **Advanced Search:** Find files based on name, type, date, size, and even content (planned).
*   **Directory Organization:** Automate the organization of your directories based on predefined or custom rules.
*   **Batch Processing:** Perform operations on multiple files or folders at once.
*   **Extensible Architecture:** Leverages the Model Control Protocol (MCP) to integrate various tools and services.
*   **Security Focused:** Includes considerations for safe file operations and user permissions.

## Architecture

File Master Agent is built upon a modular architecture:

1.  **Goose AI Agent Core:** This is the brain of the operation, responsible for:
    *   Natural Language Processing (NLP) to understand user commands.
    *   Task planning and decomposition.
    *   Orchestrating various tools and sub-agents.
    *   Maintaining conversation context.
    The Goose agent is primarily built in Rust for performance and reliability.

2.  **LangGraph Swarm (MCP Server):** This component, built with Node.js, acts as an MCP server. It exposes a set of specialized tools that the Goose agent can invoke to interact with the file system. These tools handle the low-level details of file and folder manipulation.

3.  **Model Control Protocol (MCP):** This protocol enables seamless communication between the Goose AI Agent Core and the LangGraph Swarm. The Goose agent sends requests to the MCP server (LangGraph Swarm) to execute specific file operations, and the server returns the results.

4.  **Configuration & Security:**
    *   `config/security.json`: Manages security-related configurations, potentially including whitelists, blacklists, or permission settings for file operations.
    *   `.env`: Stores environment-specific variables, such as API keys or paths.

## Getting Started

This project is currently under active development.

### Prerequisites

*   **Rust:** Ensure you have a recent version of Rust installed. (See [rustup.rs](https://rustup.rs/))
*   **Node.js:** Ensure you have Node.js (preferably a recent LTS version) and npm/yarn installed. (See [nodejs.org](https://nodejs.org/))
*   **Goose CLI:** You will need a compiled version of the Goose CLI, potentially with custom modifications included in the `goose/` directory of this project.

### Installation & Setup (Preliminary)

1.  **Clone the repository:**
    ```bash
    git clone [URL_OF_YOUR_REPO_ONCE_UPLOADED]
    cd filemaster_agent
    ```

2.  **Setup Goose AI Agent:**
    *   Navigate to the `goose/` directory.
    *   Follow the build instructions specific to the Goose project (this might involve `cargo build --release` or similar, potentially using `Cross` for cross-compilation as suggested by `Cross.toml` and `run_cross_local.md`).
    *   Ensure the `goose` CLI is accessible in your PATH or called directly.

3.  **Setup LangGraph Swarm MCP Server:**
    *   Navigate to the root directory of `filemaster_agent` (or a specific sub-directory if the Node.js project is nested, e.g., `langgraph-swarm-mcp/`).
    *   Install Node.js dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    *   Configure your `.env` file with any necessary parameters.

4.  **Run the LangGraph Swarm MCP Server:**
    *   Typically, this would be done using a script defined in `package.json`:
        ```bash
        npm start
        # or
        node src/index.js # (or the relevant entry point for the MCP server)
        ```

5.  **Run the File Master Agent (via Goose CLI):**
    *   Once the MCP server is running, you would typically start the Goose agent, configured to connect to your local MCP server. The exact command will depend on the Goose CLI's interface.
    *   Example (hypothetical):
        ```bash
        goose chat --mcp-url http://localhost:PORT_OF_MCP_SERVER
        ```

## Usage Examples

Once the agent is running, you can interact with it using natural language commands:

*   "Create a new text file named 'notes.txt' in my Documents folder."
*   "Find all PDF files modified last week in the 'Projects' directory."
*   "Move all images from 'Downloads' to 'Pictures/New_Imports' and sort them into folders by year."
*   "Delete all files older than 6 months in the 'Archive/Old_Reports' folder."
*   "What's the total size of my 'Videos' folder?"

## Technologies Used

*   **Goose AI Framework:** Core AI capabilities, NLP, and agent orchestration (Rust).
*   **LangGraphJS / LangGraph Swarm:** Provides MCP server functionality and file system tools (Node.js, TypeScript).
*   **Model Control Protocol (MCP):** Standard for communication between AI components.
*   **Rust:** For high-performance components of the Goose agent.
*   **Node.js:** For the MCP server and related JavaScript/TypeScript tooling.

## Contributing

We welcome contributions to File Master Agent! If you're interested in helping, please consider the following:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-number`.
3.  **Make your changes** and commit them with clear, descriptive messages.
4.  **Push your branch** to your fork: `git push origin feature/your-feature-name`.
5.  **Open a Pull Request** against the main repository.

Please ensure your code adheres to the project's coding standards and includes relevant tests.

## Roadmap (Planned Features)

*   **Enhanced Content-Based Search:** Integration with tools for searching within file contents (e.g., PDFs, documents).
*   **Advanced Rule-Based Organization:** Allow users to define complex rules for automatic file organization.
*   **Cloud Storage Integration:** Support for managing files in popular cloud storage services (e.g., Google Drive, Dropbox).
*   **User Profiles and Preferences:** Personalize agent behavior and default locations.
*   **GUI/Web Interface:** A visual interface for easier interaction and monitoring (potentially using `goose/ui/`).
*   **Plugin System:** Allow developers to easily add new tools and capabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
