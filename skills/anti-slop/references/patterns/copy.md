# Copy Slop Reference

Catalog of generic AI copywriting tropes, filler rhythms, and buzzword padding with their exact removal actions.

---

## Core Invariant: Pure Deletion
Never rewrite or paraphrase a flagged sentence. Never substitute a buzzword for an alternate adjective. Either delete the specific buzzword/adverb, delete the filler clause, or delete the entire hollow sentence. If removing a phrase leaves a grammatically broken statement requiring new domain copy, leave it untouched and log it under "Needs a Human".

---

## Patterns & Removal Rules

### 1. Em-Dash Clusters (`copy-em-dash-cluster`)
* **Detection**: Two or more em-dashes (`—`) or spaced hyphens within a single paragraph or sentence cluster, used as a default rhythm crutch.
* **Rule**: Delete the parenthetical dash phrase entirely, or convert the break into a clean standalone period. Remove clustered decorative dashes.

### 2. Throat-Clearing Openers (`copy-throat-clearing`)
* **Detection**: Formulaic introductory phrases before the actual topic:
  * "In today's fast-paced digital world..."
  * "It's worth noting that..."
  * "When it comes to..."
  * "In the realm of..."
  * "At the end of the day..."
  * "Needless to say..."
* **Rule**: Delete the opening filler clause. Start the sentence directly at the core point.

### 3. Inflated Marketing Hype Verbs & Buzzwords (`copy-hype-verbs`)
* **Detection**: Overused AI verbs and adjectives:
  * "unleash", "supercharge", "elevate", "harness", "empower", "revolutionize"
  * "seamlessly", "cutting-edge", "game-changer", "transformative", "unlock the power of"
* **Rule**: Delete the hype adverb/adjective. If the entire sentence is purely marketing fluff with no functional fact, delete the entire sentence.

### 4. Metaphor Inflation (`copy-metaphor-inflation`)
* **Detection**: Artificial grandiosity using conceptual nouns:
  * "tapestry", "beacon", "testament to", "symphony of", "realm of", "delve into"
* **Rule**: Delete the inflated metaphor clause or delete the sentence.

### 5. Assistant Boilerplate Leftovers (`copy-assistant-boilerplate`)
* **Detection**: Direct prompt conversational remnants:
  * "Certainly!", "Here is the component...", "In conclusion,", "I hope this helps", "Feel free to reach out"
* **Rule**: Delete the boilerplate text block entirely.

### 6. Telegraphed Binary Reversals (`copy-telegraphed-reversal`)
* **Detection**: Manufactured depth formulas:
  * "It's not just X, it's Y"
  * "Not only X, but also Y"
* **Rule**: Delete the negative setup clause ("It's not just X,"); retain the direct statement ("It's Y").

### 7. Hollow Generic Subheads (`copy-hollow-subhead`)
* **Detection**: Low-specificity subheadings repeated across generic templates:
  * "Built for the future", "Designed for scale", "Next-generation solution", "Empowering teams worldwide"
* **Rule**: Delete the subhead element entirely.

### 8. Lorem Ipsum & Dummy Text (`copy-lorem-ipsum`)
* **Detection**: "Lorem ipsum dolor sit amet", "John Doe", "Acme Corporation".
* **Rule**: Delete the placeholder text block. If the text slot requires real client data, log under "Needs a Human".
