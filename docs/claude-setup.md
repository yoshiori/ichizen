# Claude Code Auto-Continue Setup

This project includes automatic session continuation configuration for Claude Code CLI.

## Features

### 🤖 Auto-Continue Functionality
When you're in the ichizen project directory, the `claude` command automatically continues your previous session using `--continue`.

### 📁 Directory Detection
The configuration automatically detects when you're in the ichizen project and applies auto-continue behavior.

## Usage

### Basic Commands

```bash
# Auto-continue previous session (default behavior in this project)
claude

# Start a completely new session
claude-new

# Resume a specific session by ID
claude-resume <session-id>

# Use original claude command without auto-continue
command claude
```

### Examples

```bash
# Continue working on your previous session
claude "Let's continue with the Firebase implementation"

# Start fresh for a different task
claude-new "Help me with a new React component"

# Resume a specific session you know the ID for
claude-resume abc123 "Where did we leave off?"
```

## Setup

The auto-continue feature is implemented using:

1. **direnv** - Automatically loads project environment when entering directory
2. **.envrc** - Defines project environment variables and sources configuration
3. **.claude-project-config.sh** - Contains the smart `claude` function

### Installation

If you don't have direnv installed:

```bash
# Ubuntu/Debian
sudo apt install direnv

# macOS
brew install direnv
```

Add to your shell configuration (~/.bashrc, ~/.zshrc):

```bash
eval "$(direnv hook bash)"  # For bash
eval "$(direnv hook zsh)"   # For zsh
```

### Allow Configuration

When entering the project directory for the first time:

```bash
cd /path/to/ichizen
direnv allow  # Allow the project configuration to load
```

## How It Works

1. When you `cd` into the ichizen project directory, direnv automatically loads `.envrc`
2. `.envrc` sources `.claude-project-config.sh` which defines the smart `claude` function
3. The `claude` function checks if you're in the ichizen project directory
4. If yes, it automatically adds `--continue` to resume your previous session
5. If no, it behaves like normal `claude`

## Benefits

- **Seamless workflow** - No need to remember `--continue` flag
- **Context-aware** - Only applies auto-continue in this project
- **Flexible** - Multiple commands for different use cases
- **Safe** - Can always bypass with `command claude` or `claude-new`

## Troubleshooting

### Configuration not loading
```bash
direnv reload  # Reload the environment
direnv allow   # Re-allow if needed
```

### Function not working
```bash
source .claude-project-config.sh  # Manually source the config
type claude                       # Check if function is defined
```

### Reset to default behavior
```bash
unset -f claude  # Remove the function to use original claude command
```