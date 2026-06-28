# Firestore collection model

- `users/{uid}`: email, displayName, role, participantStatus, teamId, teamName, moneyWon, createdAt, updatedAt.
- `teams/{teamId}`: name, color, createdAt, updatedAt.
- `rounds/{roundId}`: number, name, status, publishedAt, deadlineAt, previousCopitaUserId, closedAt, scoredAt.
- `rounds/{roundId}/matches/{matchId}` or `matches/{matchId}`: roundId, order, competition, homeTeam, awayTeam, startsAt, division, isPleno, result, plenoScore.
- `predictions/{predictionId}`: roundId, userId, isDefault, locked, closed, submittedAt, updatedAt.
- `predictionItems/{itemId}`: predictionId, roundId, matchId, userId, pick, highlighted, plenoScore.
- `seasonPredictions/{uid}` and `seasonPredictionItems/{itemId}`: season table picks and exact-position items.
- `roundScores/{roundId_uid}`, `seasonScores/{uid}`, `standings/{uid}`: calculated points and ranking data.
- `moneyWinnings/{uid}`: editable admin money totals.
- `tieBreakResolutions/{id}` and `auditLogs/{id}`: admin-only operational records.
