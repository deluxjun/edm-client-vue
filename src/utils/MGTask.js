import auth from '@/utils/auth'

var result={
    currentTask: -1,
    isTaskEnd : false,
    result : null
}
export default class MGTask{
    soc = null;
    addr = "ws://127.0.0.1:9480/VF";
    constructor(){

    }
    createWebSocket(){
        var obj = this;
        let address = Utils.featuresDefault('websocket.addr','ws://127.0.0.1:9480/VF')
        this.soc = new WebSocket(address);
        this.soc.onmessage = this.handleMessage;
        this.soc.onopen =function(ev){
            obj.status = 0;
        }
        this.soc.onerror = function(ev){
            this.soc=null;
        }
    }

    requestToMG(type){
        var msg;
        switch (type) {
            case 1 :{  //check running
                msg = {
                    action:"isMyGuardRunning",
                    mode:"1"
                }
            }; break;
            default:{
                return false;
            }
        }
        result.currentTask = type;
        result.isTaskEnd = false;
        this.soc.send(JSON.stringify(msg));
        return true;
    }

    handleMessage(evt){
        var message = JSON.parse(evt.data);
		switch (result.currentTask) {
            case 1 :  //check running
                if (message.errcode == "0") {
                    auth.MGLogin(message.userid).then(data=>{
                        result.isTaskEnd = true;
                        result.status = 0;
                    }).catch(err=>{
                        result.isTaskEnd = true;
                        result.status = -1;
                    });
                }
                break;
        }
        
    }

    onError(evt){
        result.isTaskEnd = true;
        result.status = -1;
    }

    checkTaskEnd(){
        return result.isTaskEnd;
    }
}