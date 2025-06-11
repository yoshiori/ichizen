#!/bin/bash
# Claude Code project-specific configuration
# This file provides auto-continue functionality for this project

# Function to automatically continue Claude sessions in this project
claude() {
    # Check if we're in the ichizen project directory
    if [[ "$PWD" == *"ichizen"* ]]; then
        echo "🤖 Auto-continuing Claude session for ichizen project..."
        command claude --continue "$@"
    else
        # Outside project directory, use normal claude
        command claude "$@"
    fi
}

# Function to start a new claude session (bypassing auto-continue)
claude-new() {
    echo "🆕 Starting new Claude session..."
    command claude "$@"
}

# Function to resume a specific session by ID
claude-resume() {
    if [ -z "$1" ]; then
        echo "Usage: claude-resume <session-id> [query]"
        return 1
    fi
    echo "🔄 Resuming Claude session: $1"
    command claude --resume "$@"
}

# Show current configuration
echo "🤖 Claude Code auto-continue configured for ichizen project"
echo "   claude         - Auto-continue previous session"
echo "   claude-new     - Start new session"
echo "   claude-resume  - Resume specific session by ID"