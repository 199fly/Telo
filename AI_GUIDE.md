# AI Guide

Telo stores routines in JSON so future AI agents can generate or modify them. The key fields are:

- `id`: unique routine identifier
- `module`: area of life or habit
- `steps`: ordered array of actions

## Step Types

| Type     | Description                                   |
| -------- | --------------------------------------------- |
| `message`| Send a static text message                    |
| `question`| Ask for free text input                       |
| `counter`| Show increment/decrement buttons              |
| `log`    | Write values to the `logs` collection         |

Values within `log` steps can reference previous answers using `{{key}}` syntax.

## Logging Model

Each routine run creates a document in `logs` with:

```json
{
  "user_id": "123",
  "module": "habits",
  "date": "2025-01-01",
  "data": {"water": 8}
}
```

Future AI modules can read past logs to build new routines or dashboards.
