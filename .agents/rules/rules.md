---
trigger: always_on
---


# Rules

Applies when the user suffixes the conversation with flags.

Guidelines to follow when the user suffixes the conversation with flags:

## 1. Mode Flags

### 1.1 Work Mode
- Flag: `-w`
- Meaning: You can edit files and provide a summary of what you changed.

### 1.2 Chat Mode
- Flag: `-c`
- Meaning: Do not edit the workspace; answer the user query only.

## 2. Response Length Flags

These affect only chat response length, not the amount of work to be done.

### 2.1 Super Short Response
- Flag: `-o`
- Meaning: Keep the response as short as possible.

### 2.2 Short Response
- Flag: `-s`
- Meaning: Keep the response direct and concise.

### 2.3 Default Response
- No flag
- Meaning: Use the default response style.

### 2.4 Regulation by Line Count
- Flag: `-<number>` (for example `-1`, `-2`, `-3`)
- Meaning: Keep the response to approximately `<number>` lines.
- NOTE: `-0` means literally zero summary after work done

## 3. Notes

- Mode flags and response-length flags can be combined.
- Examples:
  - `-w1` — work mode, but provide a 1-line summary.
  - `-w0` — work mode, but provide zero summary.
  - `-cs` — chat mode only, short answer.
- No flag determines the amount of work; that remains entirely at the agent’s discretion.