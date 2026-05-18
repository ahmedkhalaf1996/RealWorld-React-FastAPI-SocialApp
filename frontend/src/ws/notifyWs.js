class WebSocketServiceNotyfy {
    constructor() {
        if(!WebSocketServiceNotyfy.instance) {
            this._ws = null;
            WebSocketServiceNotyfy.instance = this;
        }
        return WebSocketServiceNotyfy.instance;
    }

    createConnection(){
        try {
            const uri = process.env.REACT_APP_RealTimeNotificationUrl;
            const profile = JSON.parse(localStorage.getItem("profile"));
            const userId = profile?.result?._id; 

            if (!userId || !uri) return null;

            if (!this._ws || (this._ws.readyState !== WebSocket.OPEN && this._ws.readyState !== WebSocket.CONNECTING)) {
               console.log("Establishing new WebSocket connection...", userId);
                this._ws = new WebSocket(`${uri}${userId}`);
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

    closeConnection() {
        if (this._ws){
            if (this._ws.readyState === WebSocket.OPEN || this._ws.readyState === WebSocket.CONNECTING) {
                this._ws.close();
            }
            this._ws = null;
        }
        
    }


}

const instance = new WebSocketServiceNotyfy();
export default instance;