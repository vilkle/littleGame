import { LogWrap } from "../../Utils/LogWrap";
import { GameData } from "../../Data/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {

    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    timeFlag: Array<cc.Node> = [];
    @property(cc.Node)
    graph: Array<cc.Node> = [];
    @property(cc.Label)
    num: cc.Label = null;

    init(time: number) {
        let gameData = GameData.getInstance();
        this.isControllerMonkey(gameData.gameScene == 0);
        this.num.string = "x" + gameData.num;
        const upperNumbers: string[] = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        this.time.string = "第" + upperNumbers[time - 1] + (GameData.getInstance().gameScene == 0 ? "天" : "小时");
        this.time.node.position = GameData.getInstance().gameScene == 0 ? this.time.node.position : cc.v2(this.time.node.position.x + 10, this.time.node.position.y);
    }

    setAnimation() {
        let pos = this.node.position;

        let scale1 = cc.scaleTo(0.15, 0.24);

        let scale2 = cc.scaleTo(0.1, 1.1);
        let rotate2 = cc.rotateTo(0.1, 6.7);
        let move2 = cc.moveTo(0.1, cc.v2(pos.x, pos.y + 212.68));
        let spa2 = cc.spawn(scale2, move2, rotate2);

        let scale3 = cc.scaleTo(0.25, 1);
        let move3 = cc.moveTo(0.1, cc.v2(pos.x, pos.y));
        let rotate3 = cc.rotateTo(0.25, -9);
        let spa3 = cc.spawn(scale3, move3, rotate3);

        let rotate4 = cc.rotateTo(0.1, 9);

        let rotate5 = cc.rotateTo(0.1, -9);

        let rotate6 = cc.rotateTo(0.1, 0);

        let seq1 = cc.sequence(scale1, spa2, spa3, rotate4, rotate5, rotate4, rotate5, rotate4, rotate6);

        this.node.scale = 0.21;
        this.node.position = cc.v2(pos.x, pos.y - 6.93);

        this.node.runAction(seq1);
    }

    isControllerMonkey(isMonkey: boolean) {
        this.graph[0].active = isMonkey;
        this.graph[1].active = !isMonkey;
        this.timeFlag[0].active = isMonkey;
        this.timeFlag[1].active = !isMonkey;
    }
}
