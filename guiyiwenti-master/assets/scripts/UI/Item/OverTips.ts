import { BaseUI } from "../BaseUI";
import { Tools } from "../../UIComm/Tools";
import { UIManager } from "../../Manager/UIManager";
import { AudioManager } from "../../Manager/AudioManager";
import { LogWrap } from "../../Utils/LogWrap";

const { ccclass, property } = cc._decorator;
@ccclass
export class OverTips extends BaseUI {

    protected static className = "OverTips";

    @property(cc.Label)
    private label_tip: cc.Label = null;
    @property(cc.Node)
    private node_close: cc.Node = null;
    @property(sp.Skeleton)
    private spine_true: sp.Skeleton = null;

    private callback: () => void = () => { };

    constructor() {
        super();
    }

    start() {
        this.node_close.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    }

    onDisable() {
        this.node_close.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    }

    /**
     设置显示内容
     @param {number} type          0: 错误  1：答对了  2：闯关成功(一直显示不会关闭)
     @param {string} str           提示内容
     */
    init(type: number, str: string = "", callback: () => void): void {
        this.callback = callback;
        this.spine_true.node.active = type == 1;
        this.label_tip.string = str;
        switch (type) {
            case 1:
                Tools.playSpine(this.spine_true, "true", false);
                AudioManager.getInstance().playSound("sfx_genpos", false, 1);
                break;
        }
        let endPos = this.label_tip.node.position;
        let framePos_1 = cc.v2(endPos.x, endPos.y - 72.8);
        let framePos_2 = cc.v2(endPos.x, endPos.y + 12);
        let framePos_3 = cc.v2(endPos.x, endPos.y - 8);
        let framePos_4 = cc.v2(endPos.x, endPos.y + 7.3);
        this.label_tip.node.position = framePos_1;
        this.label_tip.node.runAction(cc.sequence(cc.moveTo(0.08, framePos_2), cc.moveTo(0.08, framePos_3), cc.moveTo(0.08, framePos_4), cc.moveTo(0.06, endPos)));
    }

    setBtnChangeMethod(visible: boolean) {
        this.node.getChildByName("ok").active = visible;
    }

    onBtnSureClick() {
        this.callback();
        this.onClickClose();
    }

    delayClose(): void {
        this.scheduleOnce(function () { this.onClickClose() }.bind(this), 0);
    }

    onClickClose(event?, customEventData?): void {
        if (event) AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        UIManager.getInstance().closeUI(OverTips);
    }
}
