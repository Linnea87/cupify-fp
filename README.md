# Cupify – REST API for Sports Tournaments

Cupify is a serverless REST API for managing sports tournaments, teams, matches and results. It is built as a group exam project with Node.js, AWS Lambda, API Gateway, DynamoDB and the Serverless Framework.

## Table of contents

- [Deployed API](#deployed-api)
- [Team](#team)
  - [Workflow](#workflow)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Deployment](#deployment)
- [Endpoints](#endpoints)
- [Example usage](#example-usage)
- [Error handling](#error-handling)
- [Database design](#database-design)
- [Business rules](#business-rules)

## Deployed API

**Base URL:** `https://YOUR-PROD-URL.execute-api.eu-north-1.amazonaws.com`

All endpoints below are relative to this URL.

## Team

| Name | Responsibility |
|------|----------------|
| [Linnéa](https://github.com/Linnea87) | Tournaments, standings (bonus), README |
| [Amanda](https://github.com/Amanda007) | Teams |
| [Omar](https://github.com/OmarQasoma) | Matches |

### Workflow

- Branches: `feature/CF-NN-description` and `fix/CF-NN-description`, created from `dev`
- Commits: `type(CF-NN): Description`
- All changes are merged into `dev` through pull requests with review, and `dev` is merged into `main` before submission

## Tech stack

- **Node.js 22** and JavaScript (ES modules, `.mjs`)
- **AWS Lambda** – one function per endpoint
- **Amazon API Gateway** (HTTP API)
- **Amazon DynamoDB** – multi-table design with three tables
- **Serverless Framework v4**
- **Middy** – middleware for JSON body parsing and error handling
- **Git and GitHub** – feature branches, pull requests and GitHub Projects

## Project structure
```
cupify-fp/
├── functions/ # One Lambda handler per endpoint
│ ├── tournaments/
│ ├── teams/
│ ├── matches/
│ └── standings/ # Bonus
├── services/ # All DynamoDB operations
├── middlewares/ # Shared error handler
├── responses/ # Shared response helper
├── utils/ # Validators and standings calculation
├── serverless.yml
├── local.example.yml # Template for personal config
└── package.json
```

## Getting started

### Prerequisites

- Node.js 22
- An AWS account with credentials configured (`aws configure`)
- A Serverless Framework account (`serverless login`)
- An IAM role for Lambda with access to DynamoDB, for example `AWSLambdaBasicExecutionRole` and `AmazonDynamoDBFullAccess`

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Linnea87/cupify-fp.git
   cd cupify-fp
   npm install
   ```

2. Create your personal config file from the template:
   ```bash
   cp local.example.yml local.yml
   ```

3. Fill in your own values in `local.yml`:
   ```yaml
   org: your-serverless-org
   role: arn:aws:iam::your-account-id:role/your-lambda-role
   ```
   `local.yml` is listed in `.gitignore` and must never be committed.

### Deployment

Deploy to your own AWS account:
```bash
serverless deploy
```

Deploy the production stage:
```bash
serverless deploy --stage prod
```

Each stage gets its own API URL and its own DynamoDB tables. The URL is shown in the terminal after deployment, or with `serverless info`.

## Endpoints

### Tournaments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tournaments` | Get all tournaments |
| GET | `/tournaments/{id}` | Get a tournament |
| POST | `/tournaments` | Create a tournament |
| PATCH | `/tournaments/{id}/status` | Update tournament status |
| DELETE | `/tournaments/{id}` | Delete a tournament |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tournaments/{id}/teams` | Get all teams in a tournament |
| GET | `/tournaments/{id}/teams/{teamId}` | Get a team |
| POST | `/tournaments/{id}/teams` | Create a team |
| PUT | `/tournaments/{id}/teams/{teamId}` | Update a team |
| DELETE | `/tournaments/{id}/teams/{teamId}` | Delete a team |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tournaments/{id}/matches` | Get all matches in a tournament |
| GET | `/tournaments/{id}/matches/{matchId}` | Get a match |
| POST | `/tournaments/{id}/matches` | Create a match |
| PUT | `/tournaments/{id}/matches/{matchId}` | Update a scheduled match |
| PATCH | `/tournaments/{id}/matches/{matchId}/result` | Report a match result |
| DELETE | `/tournaments/{id}/matches/{matchId}` | Delete a match |

### Bonus – Standings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tournaments/{id}/standings` | Get standings based on completed matches |

## Example usage

A typical flow, in order:

1. **Create a tournament** – `POST /tournaments`
   ```json
   { "name": "Värmland Cup", "sport": "Innebandy", "location": "Karlstad", "startDate": "2026-11-20" }
   ```
2. **Register two teams** – `POST /tournaments/{id}/teams`
   ```json
   { "name": "Grums IBK", "city": "Grums", "coach": "Anna Svensson" }
   ```
3. **Create a match** – `POST /tournaments/{id}/matches`
   ```json
   { "homeTeamId": "...", "awayTeamId": "...", "date": "2026-11-20T14:00:00Z" }
   ```
4. **Report the result** – `PATCH /tournaments/{id}/matches/{matchId}/result`
   ```json
   { "homeScore": 5, "awayScore": 3 }
   ```
5. **Get the standings** – `GET /tournaments/{id}/standings`

## Error handling

All errors are returned in the same JSON format:
```json
{ "error": "Tournament not found" }
```

| Status | Meaning |
|--------|---------|
| 400 | Invalid or missing input |
| 404 | Resource not found |
| 409 | The request breaks a business rule |
| 500 | Unexpected server error |

Extra fields in the request body are ignored. Protected fields such as `id`, `tournamentId`, `status` and scores can never be changed through the body.

## Database design

Three separate DynamoDB tables, with relations handled through IDs:

| Table | Partition key | Sort key |
|-------|---------------|----------|
| Tournaments | `type` (always `"tournament"`) | `id` |
| Teams | `tournamentId` | `id` |
| Matches | `tournamentId` | `id` |

- All lookups use `Get` or `Query`. No `Scan` is used.
- Matches only store team IDs, never team names.
- Standings are calculated on request and are not stored.

## Business rules

- A team must belong to an existing tournament
- Both teams in a match must belong to the same tournament, and a team cannot play itself
- A tournament cannot be deleted if it has teams or matches
- A team cannot be deleted if it is home or away team in any match
- A match result can only be registered once, and scores must be non-negative integers
- A completed match cannot be updated with PUT
- Updating a tournament's status does not change any other attribute

