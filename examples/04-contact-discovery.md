# Contact Discovery

## Use Case

Find emails, phones, and likely decision-makers for companies you already know by domain.

## Natural-Language Prompt

Find contact details and likely decision-makers for these company websites. Prioritize technical and decision-maker contacts.

## Recommended Tool

- `emails_and_contacts`

## Example Arguments

```json
{
  "query": ["outscraper.com", "vercel.com"],
  "preferred_contacts": ["technical", "decision makers"],
  "execution_mode": "async"
}
```

## Good Pairing

- run `company_insights` first if you need company-level firmographics before contact discovery
