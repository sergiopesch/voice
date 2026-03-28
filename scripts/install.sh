#!/usr/bin/env bash
set -euo pipefail

# Voice — quick install from pre-built release
# Usage: curl -fsSL https://raw.githubusercontent.com/sergiopesch/voice/master/scripts/install.sh | bash

VERSION="0.1.0"
DEB_URL="https://github.com/sergiopesch/voice/releases/download/v${VERSION}/Voice_${VERSION}_amd64.deb"

# ─── Colors ─────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
WHITE='\033[37m'
NC='\033[0m'

ok()   { printf "  ${GREEN}✓${NC} %s\n" "$*"; }
warn() { printf "  ${YELLOW}⚠${NC} %s\n" "$*"; }
err()  { printf "  ${RED}✗${NC} %s\n" "$*"; exit 1; }
dim()  { printf "  ${DIM}%s${NC}\n" "$*"; }

# ─── Spinner ────────────────────────────────────────────
SPINNER_PID=""
spinner_start() {
  local msg="$1"
  (
    local frames=("⣾" "⣽" "⣻" "⢿" "⡿" "⣟" "⣯" "⣷")
    local i=0
    while true; do
      printf "\r    ${CYAN}${frames[$i]}${NC} ${DIM}%s${NC}" "$msg"
      i=$(( (i + 1) % ${#frames[@]} ))
      sleep 0.07
    done
  ) &
  SPINNER_PID=$!
}

spinner_stop() {
  [[ -z "$SPINNER_PID" ]] && return
  kill "$SPINNER_PID" 2>/dev/null; wait "$SPINNER_PID" 2>/dev/null || true
  printf "\r\033[K"
  SPINNER_PID=""
}

run_step() {
  local msg="$1"; shift
  spinner_start "$msg"
  local log; log=$(mktemp)
  if "$@" > "$log" 2>&1; then
    spinner_stop; ok "$msg"; rm -f "$log"
  else
    spinner_stop; err "$msg (see output above)"
    tail -10 "$log" | while IFS= read -r l; do dim "  $l"; done
    rm -f "$log"; exit 1
  fi
}

trap 'spinner_stop' EXIT

SECONDS=0

# ─── Header ─────────────────────────────────────────────
echo
echo -e "  ${CYAN}${BOLD}██╗   ██╗ ██████╗ ██╗ ██████╗███████╗${NC}"
echo -e "  ${CYAN}${BOLD}██║   ██║██╔═══██╗██║██╔════╝██╔════╝${NC}"
echo -e "  ${CYAN}${BOLD}██║   ██║██║   ██║██║██║     █████╗  ${NC}"
echo -e "  ${CYAN}${BOLD}╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝  ${NC}"
echo -e "  ${CYAN}${BOLD} ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗${NC}"
echo -e "  ${CYAN}${BOLD}  ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝${NC}"
echo
echo -e "  ${DIM}Free, local-first desktop dictation for Linux${NC}"
echo -e "  ${DIM}v${VERSION}${NC}"
echo

# ─── Checks ─────────────────────────────────────────────
echo -e "  ${BOLD}${CYAN}[1/3]${NC} ${BOLD}Checks${NC}"

if [[ "$(uname)" != "Linux" ]]; then
  err "Voice only supports Linux. Detected: $(uname)"
fi

if [[ "$(dpkg --print-architecture 2>/dev/null)" != "amd64" ]]; then
  err "Only amd64 (x86_64) is supported. Detected: $(dpkg --print-architecture 2>/dev/null || uname -m)"
fi

ok "Linux $(uname -r)"
ok "$(dpkg --print-architecture)"

# Check runtime dependencies
if dpkg -s libwebkit2gtk-4.1-0 &>/dev/null; then
  ok "libwebkit2gtk-4.1"
else
  warn "libwebkit2gtk-4.1-0 not installed"
  dim "Run: sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1"
fi

SESSION="${XDG_SESSION_TYPE:-x11}"
if [[ "$SESSION" == "wayland" ]]; then
  command -v ydotool &>/dev/null && ok "ydotool" || warn "Missing: sudo apt install ydotool"
  command -v wl-copy &>/dev/null && ok "wl-clipboard" || warn "Missing: sudo apt install wl-clipboard"
  groups | grep -q '\binput\b' && ok "input group" || warn "Run: sudo usermod -aG input \$USER"
else
  command -v xdotool &>/dev/null && ok "xdotool" || warn "Missing: sudo apt install xdotool"
  command -v xclip &>/dev/null && ok "xclip" || warn "Missing: sudo apt install xclip"
fi

# ─── Download ───────────────────────────────────────────
echo
echo -e "  ${BOLD}${CYAN}[2/3]${NC} ${BOLD}Download${NC}"

TMPDIR=$(mktemp -d)
DEB_FILE="${TMPDIR}/Voice_${VERSION}_amd64.deb"

run_step "Downloading Voice v${VERSION} (~5 MB)" \
  wget -q -O "$DEB_FILE" "$DEB_URL"

DEB_SIZE=$(du -h "$DEB_FILE" | cut -f1)
dim "Package: Voice_${VERSION}_amd64.deb (${DEB_SIZE})"

# ─── Install ────────────────────────────────────────────
echo
echo -e "  ${BOLD}${CYAN}[3/3]${NC} ${BOLD}Install${NC}"

if sudo dpkg -i "$DEB_FILE" > /dev/null 2>&1; then
  ok "Voice installed"
else
  # Try to fix missing dependencies
  if sudo apt-get install -f -y -qq > /dev/null 2>&1; then
    ok "Voice installed (dependencies resolved)"
  else
    err "Installation failed. Try: sudo apt install -f"
  fi
fi

rm -rf "$TMPDIR"

# ─── Done ───────────────────────────────────────────────
ELAPSED=$SECONDS

echo
echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}${BOLD}  Installed in ${ELAPSED}s!${NC}"
echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "  ${WHITE}${BOLD}▸${NC} Open ${BOLD}Voice${NC} from your app launcher"
echo -e "  ${WHITE}${BOLD}▸${NC} Or run: ${CYAN}voice${NC}"
echo
echo -e "  ${DIM}First launch downloads the speech model (~142 MB, one-time).${NC}"
echo -e "  ${DIM}Then press ${BOLD}Alt+D${NC}${DIM} to dictate!${NC}"
echo
