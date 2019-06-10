import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import GamePanel from "./GamePanel";
import SubmissionPanel from "./SubmissionPanel";
import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';
import TeacherPanel from './TeacherPanel';
import { GameData } from '../../Data/GameData';


const { ccclass, property } = cc._decorator;

@ccclass
export default class TiJiaoAndFanHuiPanel extends BaseUI {

    
    protected static className = "TiJiaoAndFanHuiPanel";

    @property(cc.Button)
    btn_SaveData:cc.Button = null;

    start() {
        ListenerManager.getInstance().add(ListenerType.onDataCanSave,this,this.onSetSaveBtnState);
    }

    onFanHui() {
        ListenerManager.getInstance().trigger(ListenerType.delStudent);
        UIManager.getInstance().closeUI(GamePanel);
        GameData.getInstance().nowState =1;
        UIManager.getInstance().closeUI(TiJiaoAndFanHuiPanel);
        
    }

    onTiJiao() {
        //UIManager.getInstance().showUI(SubmissionPanel);
        ListenerManager.getInstance().trigger(ListenerType.SendDatatijiaoOnClick);
    }

    onSetSaveBtnState(state:boolean){
        this.btn_SaveData.interactable = state;
    }
}
