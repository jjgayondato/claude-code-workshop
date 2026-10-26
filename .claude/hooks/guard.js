// Safety net for Claude Code (a PreToolUse hook).
// - Blocks any read, edit, search or shell command that touches a .env file.
// - Asks the developer before any git commit.
// Claude Code sends the tool call as JSON on stdin. We answer with JSON on stdout.

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  const { tool_name: tool, tool_input: input = {} } = JSON.parse(raw);

  // .env, .env.local, .env.production ... but not .env.example
  const ENV_FILE = /(^|[\\/\s"'=<>|;&(])\.env(\.(?!example\b)[\w-]+)?(?![\w.-])/;

  const targets = tool === 'Bash'
    ? [input.command]
    : [input.file_path, input.path, input.pattern, input.glob];

  if (targets.some((t) => typeof t === 'string' && ENV_FILE.test(t))) {
    return decide('deny', '.env files hold secrets. Claude may not read, edit or search them. Ask the developer for the one value you need.');
  }

  if (tool === 'Bash' && /\bgit\s+commit\b/.test(input.command)) {
    return decide('ask', 'Claude wants to commit. Check the staged changes and the message before you say yes.');
  }
});

function decide(permissionDecision, permissionDecisionReason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason },
  }));
}
