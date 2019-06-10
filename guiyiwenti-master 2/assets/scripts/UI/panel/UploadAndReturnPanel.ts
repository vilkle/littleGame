import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import GamePanel from "./GamePanel";
import SubmissionPanel from "./SubmissionPanel";
import { GameData } from "../../Data/GameData";
import { UIHelp } from "../../Utils/UIHelp";
import { OverTips } from "../Item/OverTips";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UploadAndReturnPanel extends BaseUI {

    protected static className = "UploadAndReturnPanel";

    start() {

    }

    onFanHui() {
        UIManager.getInstance().closeUI(GamePanel);
        UIManager.getInstance().closeUI(UploadAndReturnPanel);
        UIManager.getInstance().closeUI(OverTips);
    }

    onTiJiao() {
        if (GameData.getInstance().gameState == 0) {
            UIHelp.showTip("请通关后进行保存");
            return;
        }
        UIManager.getInstance().showUI(SubmissionPanel);
    }
}
