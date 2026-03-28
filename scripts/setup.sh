#!/usr/bin/env bash
set -euo pipefail

# Voice — one-command setup
# Usage: ./scripts/setup.sh           (dev mode)
#        ./scripts/setup.sh --install  (build + install as desktop app)

# ─── Colors & Symbols ──────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $*"; }
warn() { echo -e "  ${YELLOW}!${NC} $*"; }
err()  { echo -e "  ${RED}✗${NC} $*"; }
dim()  { echo -e "  ${DIM}$*${NC}"; }

# ─── Spinner ────────────────────────────────────────────
SPINNER_PID=""
spinner_start() {
  local msg="$1"
  local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
  (
    while true; do
      for f in "${frames[@]}"; do
        printf "\r  ${CYAN}%s${NC} %s" "$f" "$msg"
        sleep 0.08
      done
    done
  ) &
  SPINNER_PID=$!
}

spinner_stop() {
  if [[ -n "$SPINNER_PID" ]]; then
    kill "$SPINNER_PID" 2>/dev/null || true
    wait "$SPINNER_PID" 2>/dev/null || true
    printf "\r\033[K"
    SPINNER_PID=""
  fi
}

# Run a command with a spinner, show ✓ on success, ✗ on failure
run_with_spinner() {
  local msg="$1"
  shift
  spinner_start "$msg"
  local tmplog
  tmplog=$(mktemp)
  if "$@" > "$tmplog" 2>&1; then
    spinner_stop
    ok "$msg"
    rm -f "$tmplog"
    return 0
  else
    local code=$?
    spinner_stop
    err "$msg"
    echo
    dim "─── Error output ───"
    tail -15 "$tmplog" | while IFS= read -r line; do dim "  $line"; done
    dim "─── End ───"
    rm -f "$tmplog"
    return $code
  fi
}

trap 'spinner_stop' EXIT

# ─── Parse Args ─────────────────────────────────────────
INSTALL_MODE=false
[[ "${1:-}" == "--install" ]] && INSTALL_MODE=true

# ─── Header ─────────────────────────────────────────────
echo
echo -e "${BOLD}${CYAN}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║${NC}${BOLD}    VOICE — Local Dictation for Linux  ${CYAN}║${NC}"
echo -e "${BOLD}${CYAN}  ╚═══════════════════════════════════════╝${NC}"
echo

SECONDS=0

# ─── OS Check ───────────────────────────────────────────
if [[ "$(uname)" != "Linux" ]]; then
  err "Voice only supports Linux. Detected: $(uname)"
  exit 1
fi

# ─── Prerequisites ──────────────────────────────────────
echo -e "${BOLD}  Prerequisites${NC}"

if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
  if (( NODE_VER >= 20 )); then
    ok "Node.js $(node -v)"
  else
    err "Node.js 20+ required (found $(node -v))"
    exit 1
  fi
else
  err "Node.js not found — install via https://nodejs.org"
  exit 1
fi

if command -v rustc &>/dev/null || command -v "$HOME/.cargo/bin/rustc" &>/dev/null; then
  RUSTC="${HOME}/.cargo/bin/rustc"
  command -v rustc &>/dev/null && RUSTC="rustc"
  ok "Rust $($RUSTC --version | awk '{print $2}')"
else
  echo
  run_with_spinner "Installing Rust via rustup" \
    bash -c 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y'
  source "$HOME/.cargo/env"
fi

# ─── System Libraries ───────────────────────────────────
echo
echo -e "${BOLD}  System Dependencies${NC}"

if command -v apt &>/dev/null; then
  run_with_spinner "Installing system libraries" \
    bash -c 'sudo apt update -qq 2>/dev/null && sudo apt install -y -qq \
      pkg-config libglib2.0-dev libsoup-3.0-dev \
      libjavascriptcoregtk-4.1-dev libwebkit2gtk-4.1-dev \
      libayatana-appindicator3-dev 2>/dev/null'
else
  warn "Not using apt — install these manually:"
  dim "pkg-config libglib2.0-dev libsoup-3.0-dev"
  dim "libjavascriptcoregtk-4.1-dev libwebkit2gtk-4.1-dev"
  dim "libayatana-appindicator3-dev"
fi

# ─── Text Insertion Tools ───────────────────────────────
SESSION="${XDG_SESSION_TYPE:-x11}"
if [[ "$SESSION" == "wayland" ]]; then
  command -v ydotool &>/dev/null && ok "ydotool found" || warn "ydotool not found — sudo apt install ydotool"
  command -v wl-copy &>/dev/null && ok "wl-clipboard found" || warn "wl-copy not found — sudo apt install wl-clipboard"
  if groups | grep -q '\binput\b'; then
    ok "User in 'input' group"
  else
    warn "Add to input group: sudo usermod -aG input \$USER"
  fi
else
  command -v xdotool &>/dev/null && ok "xdotool found" || warn "xdotool not found — sudo apt install xdotool"
  command -v xclip &>/dev/null  && ok "xclip found" || warn "xclip not found — sudo apt install xclip"
fi

# ─── npm Install ────────────────────────────────────────
echo
echo -e "${BOLD}  Dependencies${NC}"

run_with_spinner "Installing npm packages" \
  npm install --silent --prefer-offline

# ─── Build & Install ────────────────────────────────────
if [[ "$INSTALL_MODE" == true ]]; then
  echo
  echo -e "${BOLD}  Build${NC}"

  export PATH="$HOME/.cargo/bin:$PATH"

  # Build everything via cargo tauri build (handles frontend + backend + packaging)
  run_with_spinner "Compiling & packaging (this takes a few minutes)" \
    bash -c 'cd apps/desktop && cargo tauri build 2>&1'

  DEB=$(find apps/desktop/src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | head -1)
  if [[ -n "$DEB" ]]; then
    echo
    echo -e "${BOLD}  Install${NC}"
    # Run dpkg directly (not via spinner) so sudo can prompt for password
    echo -e "  ${CYAN}⠋${NC} Installing Voice..."
    if sudo dpkg -i "$DEB" > /dev/null 2>&1; then
      ok "Voice installed"
    else
      err "dpkg install failed"
      exit 1
    fi
  else
    err "No .deb package found"
    dim "Run directly: apps/desktop/src-tauri/target/release/voice"
    exit 1
  fi

  ELAPSED=$SECONDS
  MINS=$((ELAPSED / 60))
  SECS=$((ELAPSED % 60))
  if (( MINS > 0 )); then
    TIME_STR="${MINS}m ${SECS}s"
  else
    TIME_STR="${SECS}s"
  fi

  echo
  echo -e "${BOLD}${CYAN}  ╔═══════════════════════════════════════╗${NC}"
  printf  "  ${BOLD}${CYAN}║${NC}${BOLD}${GREEN}  %-37s ${BOLD}${CYAN}║${NC}\n" "Installed in ${TIME_STR}!"
  echo -e "${BOLD}${CYAN}  ╚═══════════════════════════════════════╝${NC}"
  echo
  echo -e "  Open ${BOLD}Voice${NC} from your app launcher"
  echo -e "  or run: ${CYAN}voice${NC}"
  echo
  echo -e "  ${DIM}First launch downloads the speech model (~142 MB)${NC}"
  echo -e "  ${DIM}Then press Alt+D to dictate!${NC}"
  echo
else
  ELAPSED=$SECONDS
  echo
  echo -e "${BOLD}${CYAN}  ╔═══════════════════════════════════════╗${NC}"
  printf  "  ${BOLD}${CYAN}║${NC}${BOLD}${GREEN}  %-37s ${BOLD}${CYAN}║${NC}\n" "Ready in ${ELAPSED}s!"
  echo -e "${BOLD}${CYAN}  ╚═══════════════════════════════════════╝${NC}"
  echo
  echo -e "  Development:   ${CYAN}npm run dev${NC}"
  echo -e "  Full install:  ${CYAN}./scripts/setup.sh --install${NC}"
  echo
  echo -e "  ${DIM}First launch downloads the speech model (~142 MB)${NC}"
  echo -e "  ${DIM}Then press Alt+D to dictate!${NC}"
  echo
fi
