import { BaseUI } from "../BaseUI";
import { UIHelp } from "../../Utils/UIHelp";
import { GameData } from "../../Data/GameData";
import { UIManager } from "../../Manager/UIManager";
import { ListenerType } from "../../Data/ListenerType";
import { ListenerManager } from "../../Manager/ListenerManager";


const { ccclass, property } = cc._decorator;


const des = "当前选择场景为："

@ccclass
export class SelectTip extends BaseUI {

    protected static className = "SelectTip";

    private curScene: number = null;

    @property(cc.Label)
    des: cc.Label = null;

    start() {
        if (GameData.getInstance().gameScene == 1) {
            this.des.string = des + "人 + 树";
            this.curScene = 1;
        } else if (GameData.getInstance().gameScene == 0) {
            this.des.string = des + "猴子 + 桃";
            this.curScene = 0;
        }
    }

    onBtnMethodPeopleClicked() {
        this.des.string = des + "人 + 树";
        this.curScene = 1;
    }

    onBtnMethodMonkeyClicked() {
        this.des.string = des + "猴子 + 桃";
        this.curScene = 0;
    }

    onBtnSureClick() {
        if (this.curScene == null) {
            UIHelp.showTip("还没有选中场景哦～");
            return;
        }
        GameData.getInstance().gameScene = this.curScene;
        ListenerManager.getInstance().trigger(ListenerType.GameMethodSelect, { state: this.curScene });
        UIManager.getInstance().closeUI(SelectTip);
    }

    onBtnCancelClick() {
        UIManager.getInstance().closeUI(SelectTip);
    }

}