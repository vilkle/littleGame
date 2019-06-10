import { LogWrap } from "../../Utils/LogWrap";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { AudioManager } from "../../Manager/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumBtton extends cc.Component {

    @property(cc.Button)
    myBtn: cc.Button = null;
    @property
    appearTime: number = 1;

    setBtnEnable(enable: boolean) {
        let btn = this.node.getChildByName("btn").getComponent(cc.Button);
        // btn.enableAutoGrayEffect = true;
        btn.interactable = enable;
    }

    setAction() {
        this.node.scale = 0.2;
        let action2 = cc.scaleTo(0.2, 1.1);
        let action3 = cc.scaleTo(0.3, 0.9);
        let action4 = cc.scaleTo(0.25, 1.0);
        let seq = cc.sequence(action2, action3, action4);
        this.node.runAction(seq);
    }

    onBtnClick(event, customEventData) {
        AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        ListenerManager.getInstance().trigger(ListenerType.SpeLabelTextChangeBegin, { string: customEventData });
    }
}
