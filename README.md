# <P> PryOn — SMS Scam Detector

**PryOn** is an experimental, rule-based SMS scam detector developed as a student research project for **AMAVET**.

The project explores how accurately a simple algorithm can distinguish between fraudulent and legitimate SMS messages written in Slovak — **without artificial intelligence or machine learning**.

## About the Project

SMS phishing (smishing) is a common form of online fraud. Scammers often impersonate trusted institutions, create a sense of urgency, or encourage recipients to click suspicious links.

PryOn analyzes SMS messages using predefined keywords, suspicious patterns, and a point-based scoring system.

The web application allows visitors to test the algorithm directly in their browser.

## Features

- **SMS analysis** — enter a Slovak SMS message and analyze it.
- **Random SMS examples** — try sample legitimate and fraudulent messages.
- **Rule-based classification** — no AI or machine learning.
- **Explainable results** — view detected indicators and scoring reasons.
- **Light and dark mode** — switch between two visual themes.
- **Responsive design** — works on desktop and mobile devices.
- **Client-side processing** — SMS messages are analyzed locally in the browser.

## How It Works

PryOn first converts the message to lowercase and removes diacritics.

It then searches for predefined indicators, including:

- Suspicious links
- References to institutions
- Requests for sensitive information
- Urgency and pressure
- Payment requests
- Parcel delivery messages
- Prize notifications
- Threats and account-related problems
- Verification requests

The algorithm assigns points to selected indicators and combinations of indicators.

| Score | Classification |
|---|---|
| 0–3 points | LEGIT |
| 4+ points | SCAM |

**Note:** `LEGIT` means the message did not reach the algorithm's scam threshold. It does not guarantee that the message is safe.

## Research Results

The original Python algorithm was evaluated using a dataset of **60 Slovak SMS messages**: 30 fraudulent and 30 legitimate.

| Metric | Result |
|---|---|
| Overall accuracy | 60% |
| Correctly identified scams | 6 / 30 |
| Correctly identified legitimate messages | 30 / 30 |
| Missed scams | 24 / 30 |
| Legitimate messages incorrectly flagged | 0 / 30 |

The research hypothesis expected at least **80% accuracy**, but this threshold was not achieved.

These results demonstrate the limitations of a simple rule-based approach, particularly its difficulty identifying fraudulent messages that do not contain the predefined suspicious patterns.

## Technologies Used

- **Python** — original classification algorithm and experimental testing
- **HTML** — web application structure
- **CSS** — interface design and responsive layout
- **JavaScript** — browser-based implementation of the classification algorithm

No backend server or external AI API is required for the web demo.

## Project Structure

```text
PryOn/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Running the Web App

1. Clone or download this repository.
2. Open `index.html` in a web browser.
3. Enter an SMS message or generate a random example.
4. Click **Analyze** to view the classification, score, and detected indicators.

## Disclaimer

**PryOn is an educational and experimental project, not a reliable security solution.**

The algorithm can incorrectly classify fraudulent messages as legitimate. Never rely solely on PryOn to determine whether an SMS is safe.

Avoid clicking unknown links or sharing passwords, payment details, or other sensitive information in response to suspicious messages.

## Project Context

Developed for **AMAVET**, as part of a student research project investigating the accuracy and limitations of rule-based SMS scam detection.

**Research question:** *How accurately can a rule-based algorithm distinguish between fraudulent and legitimate SMS messages?*
