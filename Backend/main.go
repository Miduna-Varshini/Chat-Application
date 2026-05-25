package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
	"github.com/gorilla/websocket"
)

type Message struct {
	Name string `json:"name"`
	Text string `json:"text"`
	Time string `json:"time"`
}

type Client struct {
	conn *websocket.Conn
}

var (
	clients   = make(map[*Client]bool)
	broadcast = make(chan Message)
	mu        sync.Mutex
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	client := &Client{conn: ws}

	mu.Lock()
	clients[client] = true
	mu.Unlock()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			mu.Lock()
			delete(clients, client)
			mu.Unlock()
			break
		}

		msg.Time = time.Now().Format("15:04") // HH:MM format
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast

		data, _ := json.Marshal(msg)

		mu.Lock()
		for client := range clients {
			client.conn.WriteMessage(websocket.TextMessage, data)
		}
		mu.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	fmt.Println("Server running on :8000")
	http.ListenAndServe(":8000", nil)
}