import { LogWrap } from "../../Utils/LogWrap";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { UIHelp } from "../../Utils/UIHelp";
import { BaseUI } from "../BaseUI";

const { ccclass, property } = cc._decorator;

const startX = 10;

@ccclass
export default class SpeLabel extends BaseUI {

    @property(cc.Node)
    label: cc.Node = null;
    @property(cc.Node)
    cursor: cc.Node = null;
    @property
    maxLength: number = 6;

    start() {
        this.cursor.active = false;
        this.label.getComponent(cc.Label).string = "";
        ListenerManager.getInstance().add(ListenerType.CursorUpdate, this, this.updateCursor);
        ListenerManager.getInstance().add(ListenerType.SpeLabelTextChangeBegin, this, this.upString);
    }

    setEnable(enable: boolean) {
        this.node.getComponent(cc.Button).interactable = enable;
    }

    setCursor(visible: boolean) {
        this.cursor.active = visible;
        this.cursor.runAction(cc.repeatForever(cc.blink(1, 1)));
        this.cursor.position = cc.v2(startX + this.label.getContentSize().width, this.cursor.position.y);
    }

    setMaxLength(num: number) {
        this.maxLength = num;
    }

    setString(str: string) {
        let labStr = this.label.getComponent(cc.Label).string;
        if (str == "del") {
            this.label.getComponent(cc.Label).string = labStr.slice(0, labStr.length - 1);
            this.scheduleOnce(() => {
                this.cursor.position = cc.v2(startX + this.label.getContentSize().width, this.cursor.position.y);
            }, 0);
            ListenerManager.getInstance().trigger(ListenerType.SpeLabelTextChange);
            return;
        }
        if (labStr.length >= this.maxLength) {
            UIHelp.showTip("输入字符过多");
            return;
        }
        this.label.getComponent(cc.Label).string = labStr + str;
        this.scheduleOnce(() => {
            this.cursor.position = cc.v2(startX + this.label.getContentSize().width, this.cursor.position.y);
        }, 0);
        ListenerManager.getInstance().trigger(ListenerType.SpeLabelTextChange);

    }

    onBtnClick() {
        ListenerManager.getInstance().trigger(ListenerType.CursorUpdate);
        this.setCursor(true);
        ListenerManager.getInstance().trigger(ListenerType.SpeLabelTextChangeEnd);
    }

    private upString(event) {
        if (this.cursor.active) this.setString(event.string);
    }

    private updateCursor() {
        if (this.cursor) this.cursor.active = false;
    }

}
