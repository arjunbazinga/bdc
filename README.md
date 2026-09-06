# Burns Depression Checklist

A private, offline-friendly version of the Burns Depression Checklist from
[Feeling Good](https://en.wikipedia.org/wiki/Feeling_Good:_The_New_Mood_Therapy)
by David D. Burns.

Twenty-five questions, a score out of 100, and a plain-language note about
what that score usually means. Answers never leave the browser.

**Use it:** [arjunbazinga.github.io/bdc](https://arjunbazinga.github.io/bdc)

## What this is

- A screening questionnaire, not a diagnosis
- Four sections: thoughts and feelings, activities and relationships,
  physical symptoms, and suicidal urges
- Instant results with the original score bands (0–5 through 76–100)
- Progress saved locally so you can close the tab and pick up later
- Installable as a Progressive Web App, including offline

If the last three questions are not “not at all,” the results page also
points to [findahelpline.com](https://findahelpline.com) and a few
country-specific numbers.

## Local development

The site is static. Any local server works:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
