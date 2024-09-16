package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sort"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"golang.org/x/net/context"
)

var (
	rdb *redis.Client
	ctx = context.Background()
)

type User struct {
	Username string `json:"username"`
	Wins     int    `json:"wins"`
	Losses   int    `json:"losses"`
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379", 
	})
}


func registerUser(w http.ResponseWriter, r *http.Request) {
	var newUser User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if newUser.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	_, err = rdb.Get(ctx, newUser.Username+":wins").Result()
	if err == redis.Nil {
		
		err := rdb.Set(ctx, newUser.Username+":wins", 0, 0).Err()
		if err != nil {
			http.Error(w, "Error creating user", http.StatusInternalServerError)
			return
		}
		err = rdb.Set(ctx, newUser.Username+":losses", 0, 0).Err()
		if err != nil {
			http.Error(w, "Error creating user", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	} else if err != nil {
		http.Error(w, "Error checking user", http.StatusInternalServerError)
		return
	} else {
		
		http.Error(w, "Username already taken", http.StatusConflict)
	}
}


func loginUser(w http.ResponseWriter, r *http.Request) {
	var loginUser User
	err := json.NewDecoder(r.Body).Decode(&loginUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if loginUser.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	
	_, err = rdb.Get(ctx, loginUser.Username+":wins").Result()
	if err == redis.Nil {
		http.Error(w, "User not found. Please register first.", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Error checking user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}


func updateStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	query := r.URL.Query()
	result := query.Get("result")

	if result == "win" {
		
		_, err := rdb.Incr(ctx, username+":wins").Result()
		if err != nil {
			http.Error(w, "Error incrementing wins", http.StatusInternalServerError)
			return
		}
	} else if result == "loss" {
		
		_, err := rdb.Incr(ctx, username+":losses").Result()
		if err != nil {
			http.Error(w, "Error incrementing losses", http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, "Invalid result type. Use 'win' or 'loss'.", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User stats updated successfully"))
}


func getLeaderboard(w http.ResponseWriter, r *http.Request) {
	
	keys, err := rdb.Keys(ctx, "*:wins").Result()
	if err != nil {
		http.Error(w, "Error retrieving users", http.StatusInternalServerError)
		return
	}

	users := []User{}
	for _, key := range keys {
		wins, err := rdb.Get(ctx, key).Result()
		if err != nil {
			continue
		}

		winsInt, _ := strconv.Atoi(wins)
		username := key[:len(key)-5] 
		users = append(users, User{Username: username, Wins: winsInt})
	}

	
	sort.Slice(users, func(i, j int) bool {
		return users[i].Wins > users[j].Wins
	})

	if len(users) > 3 {
		users = users[:3]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func main() {
	initRedis()

	router := mux.NewRouter()


	router.HandleFunc("/register", registerUser).Methods("POST")

	router.HandleFunc("/login", loginUser).Methods("POST")

	router.HandleFunc("/update-stats/{username}", updateStats).Methods("POST")

	
	router.HandleFunc("/leaderboard", getLeaderboard).Methods("GET")

	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{"*"}) 

	fmt.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(headers, methods, origins)(router)))
}


