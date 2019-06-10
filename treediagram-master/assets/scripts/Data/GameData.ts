import { LogWrap } from "../Utils/LogWrap";
/**游戏数据类 */
export class GameData {
    private static instance: GameData;
    public gameAnswer:Array<string> = null;
    public topic:Array<string> = null;
    public topicDes:string="0";
    public nowState:number =1;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new GameData();
        }
        return this.instance; 
    }
}