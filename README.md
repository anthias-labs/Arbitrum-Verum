# Arbitrum-Verum
Automatic Arbitrum reputation scoring

## Scoring system

Currently, wallets are evaluated according to the following metrics:
Verum Individual Weighting Breakdown

### 10% - Health factors in Arbitrum-based lending markets

- No health factor = 50
- Health factor < 1 = 20
- Health factor 1 < HF < 1.1 = 60
- Health Factor 1.1 < HF < 1.3 = 80
- Health Factor > 1.3 = 90

### 15% (but docked fully if bot) - Number of transactions > $10

- Bot = 0
- 30 tx = 20
- 50 tx = 40
- 100 tx = 60
- 150 tx = 80
- 200+ tx = 90

### 20% - Voting participation on Arbitrum Snapshot

- Participation < 20% = 0
- Participation 20% < P < 30% = 40
- Participation 30% < P < 50% = 60
- Participation 50% < P < 70% = 75
- Participation > 70% = 90

### 20% - Number of Arbitrum contracts interacted with

- Bot = 0
- Interactions < 3 contracts = 0
- Contract Interactions 3 < I < 7 = 20
- Contract Interactions 7 < I < 15 = 35
- Contract Interactions 15 < I < 25 = 50
- Contract Interactions 25 < I < 50 = 70
- Contract Interaction > 50 = 85

### 20% - Amount of assets on Arbitrum

- $0 = 0
- Assets $1 < A < $500 = 15
- Assets $501 < A < $1500 = 30
- Assets $1501 < A < $3000 = 40
- Assets $3001 < A < $6000 = 55
- Assetss $6001 < A < $10000 = 70
- Assets $10001 < A < $25000 = 75
- Assets $25001 < A < $50000 = 85
- Assets > $50000 = 90

### 15% - Time joined Arbitrum to reward long-time users of Arbitrum

- Date first joined < 5 days ago = 10
- Date first joined 6 days < D < 30 days = 15
- Date 31 days < D < 60 days = 20
- Date 61 days < D < 3 months = 30
- Date 3.1 months < D < 6 months = 50 points
- Date 6.1 months < D < 9 months = 65 points
- Date 9.1 months < D < 12 months = 70 points
- Date 1 year < D < 1.5 years = 80 points
- Date > 1.5 years = 90 points

