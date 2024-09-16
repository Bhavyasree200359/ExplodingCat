Here’s a basic `README.md` file for your project, which provides an overview of your React frontend and Go backend with Redis integration:

---

# Exploding Kitten Game

This is a full-stack web application where users can register, login, and track their game stats for the "Exploding Kitten" game. The application consists of:

- A **React frontend** with routing for home and user pages.
- A **Go backend** that handles user registration, login, updating game stats (wins/losses), and retrieving the leaderboard.
- A **Redis database** for storing user stats (wins and losses).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Usage](#usage)
- [License](#license)

## Prerequisites

Make sure you have the following tools installed on your local machine:

- [Node.js](https://nodejs.org/en/download/) (for the React frontend)
- [Go](https://golang.org/dl/) (for the backend)
- [Redis](https://redis.io/download) (for database)

## Setup

### Frontend

1. Clone the repository:

    ```bash
    git clone https://github.com/Bhavyasree200359/ExplodingCat.git
    cd Exploding Kitten-game
    ```

2. Install dependencies:

    ```bash
    cd exploding-kitten
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

    This will start the frontend on `http://localhost:3000`.

### Backend

1. Navigate to the backend directory:

    ```bash
    cd backend
    cd exploding-kittens-backend
    ```

2. Install Go dependencies:

    ```bash
    go mod tidy
    ```

3. Set up Redis:
   Ensure that Redis is running locally on `localhost:6379`. You can modify the Redis connection string in the code if your setup is different.

4. Run the Go server:

    ```bash
    go run main.go
    ```

    The backend will run on `http://localhost:8080`.

## Usage

1. Open the frontend in your browser: `http://localhost:3000`.

2. You can register as a new user, log in, and then view your game stats. You can also update your stats after each game, and the leaderboard will display the top 3 players.

## License

This project is licensed under the MIT License.

---

This file gives users all the necessary information to set up and run your application. You can adjust the repository URL and other specifics as needed.
