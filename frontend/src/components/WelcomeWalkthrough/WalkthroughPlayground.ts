/**
 * Interactive playground starter code for BODHI EDITOR first-time walkthrough.
 * Users can edit, run, and experiment with shortcuts and AI features here.
 */
export const PLAYGROUND_SAMPLE_CODE = `/**
 * ==============================================================================
 * 🚀 WELCOME TO BODHI EDITOR INTERACTIVE PLAYGROUND
 * ==============================================================================
 * This is an interactive sandbox where you can test BODHI superpowers live!
 *
 * 🎯 CHALLENGE 1: Test Keyboard Shortcuts
 * ------------------------------------------------------------------------------
 * • Ctrl + P           -> Open Command Palette & Quick File Search
 * • Ctrl + \`           -> Toggle Integrated Terminal Drawer
 * • Ctrl + B           -> Toggle Activity Sidebar
 * • Ctrl + \\           -> Toggle Split Editor Side-by-Side
 * • Ctrl + ,           -> Open Real-Time Settings & Theme Studio
 *
 * 🎯 CHALLENGE 2: Try Ambient AI Refactoring (Ctrl + I)
 * ------------------------------------------------------------------------------
 * Highlight the function below, press 'Ctrl + I', and ask:
 * "Optimize this function and add full TypeScript docstrings"
 */

function calculateFibonacci(n: number): number[] {
  const sequence: number[] = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence.slice(0, n);
}

// 🎯 CHALLENGE 3: Test Real-Time Inline Completion (Ghost Text)
// Start typing below: 'async function fetchUserProfile' and pause for 0.7s:
// 


/**
 * 🎯 CHALLENGE 4: Integrated PTY Terminal
 * ------------------------------------------------------------------------------
 * Press 'Ctrl + \`' to open your terminal below.
 * Try typing 'node --version' or running a quick script!
 */

console.log("Welcome to BODHI! Fibonacci sequence of 8 numbers:");
console.log(calculateFibonacci(8));
`;
