#!/bin/bash

# =============================================================================
# Pre-commit Security Verification Script
# =============================================================================
# Run this before making the repository public to verify no secrets exposed
# Usage: bash scripts/verify-security.sh
#        or: npm run security:verify

echo "🔒 Security Verification - Pre-Public Checklist"
echo "================================================"
echo ""

ERRORS=0

# Check 1: Ensure .env is not tracked
echo "✓ Checking .env is not tracked by git..."
if git ls-files | grep -q "^\.env$"; then
    echo "❌ ERROR: .env file is tracked by git!"
    echo "   Run: git rm --cached .env"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ .env is not tracked"
fi

# Check 2: Scan git history for .env
echo ""
echo "✓ Checking git history for .env commits..."
if git log --all --full-history -- .env 2>&1 | grep -q "commit"; then
    echo "❌ WARNING: .env was committed in git history!"
    echo "   Review: git log --all --full-history -- .env"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ No .env in git history"
fi

# Check 3: Scan for hardcoded secrets patterns
echo ""
echo "✓ Scanning for hardcoded secrets..."
SECRET_PATTERNS=(
    "PAYLOAD_SECRET=[a-f0-9]{64}"
    "POSTGRES_PASSWORD=[a-f0-9]{32}"
    "sk-ant-[a-zA-Z0-9]{48}"
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if git grep -E "$pattern" -- ':!.env' ':!.env.example' ':!scripts/' ':!*.md' 2>/dev/null; then
        echo "❌ WARNING: Potential secret found matching: $pattern"
        SECRETS_FOUND=1
        ERRORS=$((ERRORS + 1))
    fi
done

# Check for postgresql:// patterns but exclude ${VARIABLE} substitutions (those are safe)
if git grep -E "postgresql://[^$]*:[^$@{]*@" -- ':!.env' ':!.env.example' ':!scripts/' ':!*.md' 2>/dev/null | grep -v '\${'; then
    echo "❌ WARNING: Hardcoded database credentials found in postgresql:// URL"
    SECRETS_FOUND=1
    ERRORS=$((ERRORS + 1))
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    echo "  ✅ No hardcoded secrets found"
fi

# Check 4: Verify .gitignore exists and has .env
echo ""
echo "✓ Checking .gitignore configuration..."
if [ ! -f .gitignore ]; then
    echo "❌ ERROR: .gitignore file not found!"
    ERRORS=$((ERRORS + 1))
elif ! grep -q "^\.env$" .gitignore; then
    echo "❌ ERROR: .env not in .gitignore!"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ .gitignore properly configured"
fi

# Check 5: Verify .env.example has only placeholders
echo ""
echo "✓ Checking .env.example has no real secrets..."
if grep -E "(sk-ant-[a-zA-Z0-9]{48}|[a-f0-9]{64})" .env.example 2>/dev/null | grep -v "your-secret-here" | grep -v "sk-ant-your-key"; then
    echo "❌ WARNING: .env.example may contain real secrets!"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ .env.example has only placeholders"
fi

# Check 6: Verify SECURITY.md exists
echo ""
echo "✓ Checking SECURITY.md exists..."
if [ ! -f SECURITY.md ]; then
    echo "❌ WARNING: SECURITY.md not found!"
    echo "   Create security documentation before going public"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ SECURITY.md exists"
fi

# Check 7: Verify README.md has security warnings
echo ""
echo "✓ Checking README.md has security warnings..."
if ! grep -q "Security Notice" README.md; then
    echo "❌ WARNING: README.md missing security notice!"
    echo "   Add security warnings to README.md"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ README.md has security warnings"
fi

# Check 8: Scan for common secret patterns in staged files
echo ""
echo "✓ Checking staged files for secrets..."
STAGED_SECRETS=$(git diff --cached | grep -E "(PAYLOAD_SECRET|POSTGRES_PASSWORD|ANTHROPIC_API_KEY)" | grep -v "your-" | grep -v "<" | wc -l)
if [ "$STAGED_SECRETS" -gt 0 ]; then
    echo "❌ WARNING: Potential secrets found in staged changes!"
    echo "   Review: git diff --cached"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ No secrets in staged files"
fi

# Summary
echo ""
echo "================================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo ""
    echo "Repository is SAFE to make public."
    echo ""
    echo "Final steps:"
    echo "1. Review staged changes: git diff --cached"
    echo "2. Commit: git commit -m 'docs(security): Add security documentation'"
    echo "3. Push to GitHub"
    echo "4. Make repository public in GitHub settings"
    exit 0
else
    echo "❌ Found $ERRORS security issue(s)"
    echo ""
    echo "Please fix the issues above before making repository public."
    exit 1
fi
