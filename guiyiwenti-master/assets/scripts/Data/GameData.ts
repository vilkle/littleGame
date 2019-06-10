import { LogWrap } from "../Utils/LogWrap";
/**游戏数据类 */
export class GameData {
    private static instance: GameData;

    public gameState = 0;  //0表示游戏中 1表示游戏结束

    public gameScene = null;  //0为猴子和桃  1为人和树
    public methodTime = 1;
    public totalNum: string = "0";
    public time: string = "0";
    public num: string = "0";
    public method1: string = "";    //格式“40/4=10;10/2=5”
    public method2: string = "";


    static getInstance() {
        if (this.instance == null) {
            this.instance = new GameData();
        }
        return this.instance;
    }
}