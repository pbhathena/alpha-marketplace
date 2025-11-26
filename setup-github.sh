#!/bin/bash

# Alpha Marketplace - GitHub Setup Script
# This script will create the repository on GitHub and push the initial commit

echo "Alpha Marketplace - GitHub Setup"
echo "================================="
echo ""

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo "GitHub CLI is not authenticated. Please authenticate first:"
    echo ""
    echo "  gh auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "Creating repository on GitHub..."
gh repo create pbhathena/alpha-marketplace \
    --public \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo ""
    echo "Success! Repository created and pushed."
    echo ""
    echo "GitHub URL: https://github.com/pbhathena/alpha-marketplace"
    echo ""
else
    echo ""
    echo "Failed to create repository. Please check the error message above."
    exit 1
fi
