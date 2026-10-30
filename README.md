# ⚖ DECIDE — The "I Can't Decide" Decision Maker

Stuck between two things? Can't decide whether to do one thing at all?
Type it in. DECIDE either **interviews you with a short questionnaire** to find out what you really want, or **lets the AI make the call for you**.

```
 What are you stuck on?  >  Pizza  vs  Biryani
 How should I decide?    >  [1] Ask me questions    [2] Just decide for me
```

---

## ✨ What It Does

| You type | DECIDE understands it as | Example |
|---|---|---|
| **Two things** | A choice between A and B | `Pizza` / `Biryani` |
| **One thing** | A yes/no decision ("should I?") | `Buy a new phone` |
| **A sentence** | The app works out the options itself | `Should I learn Java or Python first?` |

Then you pick how it decides:

### 🎯 Mode 1: Questionnaire (you stay in control)
1. The AI writes **4–7 tailored questions** about *your* situation (budget, mood, time, risk, long-term goals, etc.), not generic ones.
2. You answer each one quickly (tap an option or type your own).
3. DECIDE scores each option against your answers and gives you:
   - the **winner**,
   - a **confidence score** (e.g. 72% vs 28%),
   - a **plain-language explanation** of *why*, built from your own answers.

### 🎲 Mode 2: Let AI Decide (zero effort)
- No questions. The AI weighs the options with common sense and returns **one clear pick**, a short reason, and an honest confidence level.
- Hit **Re-roll** to get a second opinion, or **Switch to Questionnaire** if the pick feels wrong. A strong gut reaction to the answer is itself useful information.

---

## ⚡ Quick Start

### 1. Requirements
- Python 3.9+
- An Anthropic API key (get one at https://console.anthropic.com)

### 2. Install
```bash
cd decide
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
```

### 3. Add your API key
Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=your_key_here
```

### 4. Run
```bash
python main.py            # command-line version
streamlit run app.py      # web version (opens in your browser)
```

---

## 🖥 Usage Example

```
$ python main.py

What can't you decide?  (type 1 or 2 things, separated by "vs" or a comma)
> Gym in the morning vs Gym in the evening

How do you want to decide?
  [1] Ask me a few questions
  [2] Just decide for me
> 1

Q1/5  When do you usually have the most energy?
      a) Early morning   b) Afternoon   c) Evening   d) Varies
> a

Q2/5  How strict is your work/college schedule in the morning?
...

✅ DECISION: Gym in the morning   (confidence 78%)
Why: You have the most energy early, your evenings are unpredictable,
and you said consistency matters more to you than workout intensity.
```

---

## 📂 Project Structure

```
decide/
├── main.py              # CLI entry point and flow control
├── app.py               # Streamlit web interface
├── requirements.txt     # Dependencies
├── .env                 # Your API key (never commit this)
├── config.py            # Model name, question count, timeouts, tone
├── parser.py            # Turns user input into 1-option or 2-option decisions
├── questionnaire.py     # Asks the AI for tailored questions, collects answers
├── scorer.py            # Weighs answers and computes the winner + confidence
├── ai_decider.py        # "Just decide for me" mode, with re-roll support
├── explain.py           # Builds the final plain-language explanation
├── history.py           # Saves past decisions to history/decisions.json
└── history/             # Past decisions (optional, local only)
```

---

## 🧠 How It Works

1. **Parse**: `parser.py` splits input on `vs`, `or`, `,` and `/`. One item becomes a yes/no decision; free-form sentences are sent to the AI to extract the options.
2. **Ask or decide**:
   - *Questionnaire:* `questionnaire.py` sends your options to the AI and requests strict JSON: a list of questions, each with multiple-choice answers and a *weight* (how much that question matters for this decision).
   - *AI Decide:* `ai_decider.py` asks for a single JSON verdict: `{winner, reason, confidence}`.
3. **Score**: each answer nudges points toward one option, multiplied by the question's weight. `scorer.py` turns the totals into percentages.
4. **Explain**: the AI writes a short, friendly justification that quotes *your* answers back to you.
5. **Tie-breaker**: if the final margin is under 5%, DECIDE says so honestly and offers a coin flip or one extra deciding question instead of faking confidence.

---

## ⚙ Configuration (`config.py`)

| Setting | Default | What it does |
|---|---|---|
| `MODEL` | `claude-sonnet-4-6` | Which Claude model to use |
| `NUM_QUESTIONS` | `5` | Questions asked in questionnaire mode (3–7) |
| `TIE_MARGIN` | `0.05` | Below this score gap, DECIDE reports a tie |
| `SAVE_HISTORY` | `True` | Keep a local log of past decisions |
| `TONE` | `"friendly"` | `friendly`, `blunt`, or `funny` explanation style |

---

## 🔒 Privacy

- Your options and answers are sent to the Anthropic API **only** to generate questions and the verdict.
- History is stored **locally** in `history/decisions.json`. Delete the file any time, or set `SAVE_HISTORY = False`.
- Your API key lives in `.env`. Add `.env` to `.gitignore` so it never gets uploaded.

---

## ⚠ Please Note

DECIDE is built for everyday choices: food, shopping, study plans, weekend plans, which task to do first. For **medical, legal, financial, or other high-stakes decisions**, treat its answer as a thinking aid, not advice, and talk to a qualified person.

---

## 🛠 Troubleshooting

- **`AuthenticationError`**: check that `.env` exists and `ANTHROPIC_API_KEY` is correct, with no quotes or spaces.
- **AI returned invalid JSON**: DECIDE retries up to 2 times automatically; if it keeps failing, lower `NUM_QUESTIONS` or switch the model.
- **No internet / API down**: DECIDE falls back to an offline coin flip so you still get an answer, clearly labelled as random.
- **It picked something I disagree with**: that's useful. Notice your reaction, or press **Re-roll** / switch to Questionnaire mode.

---

## 🗺 Roadmap

- [ ] Voice input ("Hey DECIDE, pizza or biryani?")
- [ ] Group mode: everyone answers privately, DECIDE finds the choice that fits the most people
- [ ] Pros-and-cons table view
- [ ] Learn your preferences over time from `history/`
- [ ] Mobile-friendly PWA

---

## 📄 License

MIT. Use it, remix it, decide things with it.
