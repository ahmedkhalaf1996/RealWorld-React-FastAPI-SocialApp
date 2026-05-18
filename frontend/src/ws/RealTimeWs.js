class WebSocketService { 
    constructor() {
        if(!WebSocketService.instance) {
            this._ws = null;
            this._listeners = [];
            WebSocketService.instance = this;
        }
        return WebSocketService.instance;
    }

    createConnection(){
        try {
            const uri = process.env.REACT_APP_RealTimeUrl;
            const profile = JSON.parse(localStorage.getItem("profile"));
            const userId = profile?.result?._id; 

            if (!userId || !uri) return null;

            if (!this._ws || (this._ws.readyState !== WebSocket.OPEN && this._ws.readyState !== WebSocket.CONNECTING)) {
               console.log("Establishing new WebSocket chat connection...", userId);
                this._ws = new WebSocket(`${uri}${userId}`);

                this._ws.addEventListener("message", (event) => {
                    this._listeners.forEach((fn) =>{
                        try { fn(event);} catch (e) {console.error("WebSocket listener error:", e)};
                });
                });
            }
            return this._ws;
        } catch (error) {
            console.error("WebSocket connection error:", error);
            return null;
        }
    }

    getConnection() {
        return this.createConnection();
     }

     addMessagelistener(fn) {
        if (!this._listeners.includes(fn)) {
            this._listeners.push(fn);
        }
        this.createConnection();
        return () => this.removeMessageListener(fn);
    }

    removeMessageListener(fn) {
        this._listeners = this._listeners.filter((listener) => listener !== fn);
    }

    sendJson(payload) {
        const ws = this.getConnection();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
            return true;
        } 
        return false;
    }

    closeConnection() {
        if (this._ws){
            if (this._ws.readyState === WebSocket.OPEN || this._ws.readyState === WebSocket.CONNECTING) {
                this._ws.close();
            }
            this._ws = null;
        }
        this._listeners = [];
    }

}

const instance = new WebSocketService();
export default instance;