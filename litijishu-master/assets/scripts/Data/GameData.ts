import { LogWrap } from "../Utils/LogWrap";
/**游戏数据类 */
export class GameData {
    public topic:Array<string> = null;
    private static instance: GameData;
    public type:number = 0;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new GameData();
        }
        return this.instance;
    }
}