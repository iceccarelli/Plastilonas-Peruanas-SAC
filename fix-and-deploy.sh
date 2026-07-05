#!/usr/bin/env bash
# ============================================================================
# Plastilonas Peruanas SAC — one-shot fix & deploy
#
# This script is INDEPENDENT of your current local git state. It:
#   1. Aborts any stuck git am / rebase
#   2. Resets local main to exactly what is on GitHub
#   3. Applies both fix patches (they are already committed on main)
#   4. Removes the patch delivery files
#   5. Verifies the production build
#   6. Pushes — which is the step that triggers the Vercel deploy
#
# Usage (from the repo root in Codespaces):
#   bash fix-and-deploy.sh
# ============================================================================
set -euo pipefail

main() {
  echo "==> [0/6] Sanity check: correct repository"
  git remote get-url origin | grep -qi "Plastilonas-Peruanas-SAC" || {
    echo "ERROR: this does not look like the Plastilonas repo. Aborting."; exit 1;
  }

  echo "==> [1/6] Aborting any stuck git operations"
  git am --abort 2>/dev/null || true
  git rebase --abort 2>/dev/null || true
  git merge --abort 2>/dev/null || true

  git config user.name  >/dev/null 2>&1 || git config user.name  "Vincenzo Grimaldi"
  git config user.email >/dev/null 2>&1 || git config user.email "vince.ceccarelli@gmail.com"

  echo "==> [2/6] Resetting local main to GitHub's state"
  git fetch origin
  git checkout -f main
  git reset --hard origin/main
  git clean -fd -e node_modules -e .next -e .env.local -e fix-and-deploy.sh

  echo "==> [3/6] Applying fix patches (already present on main)"
  test -f plastilonas-fix-complete.patch    || { echo "ERROR: plastilonas-fix-complete.patch missing on main"; exit 1; }
  test -f plastilonas-responsive-v2.patch   || { echo "ERROR: plastilonas-responsive-v2.patch missing on main"; exit 1; }
  git am plastilonas-fix-complete.patch
  git am plastilonas-responsive-v2.patch

  echo "==> [4/6] Removing patch delivery files"
  git rm -q plastilonas-fix-complete.patch plastilonas-responsive-v2.patch
  git rm -q --ignore-unmatch fix-and-deploy.sh
  rm -f fix-and-deploy.sh
  git commit -q -m "chore: remove applied patch files"

  if [ "${DRY_RUN:-0}" != "1" ]; then
    echo "==> [5/6] Verifying production build"
    npm ci --no-audit --no-fund
    npm run build

    echo "==> [6/6] Pushing to GitHub — this triggers the Vercel deploy"
    git push origin main
    echo ""
    echo "============================================================"
    echo " DONE. Watch the deployment at https://vercel.com"
    echo " Live in ~2 min: https://plastilonas-peruanas-sac.vercel.app"
    echo "============================================================"
  else
    echo "==> DRY_RUN: skipping build and push"
  fi

  git log --oneline -4
}

main "$@"
