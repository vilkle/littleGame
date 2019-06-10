import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import GamePanel from "./GamePanel";
import SubmissionPanel from "./SubmissionPanel";
import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';


const { ccclass, property } = cc._decorator;

@ccclass
export default class UploadAndReturnPanel extends BaseUI {

    protected static className = "UploadAndReturnPanel";
    
    @property(cc.Button)
    btn_Submit:cc.Button = null;

    start() {
        ListenerManager.getInstance().add(ListenerType.onOnClickSaveDataBtnInteractable,this,this.OnSetSaveBtnState);
    }

    init(){
        
    }


    OnSetSaveBtnState(state:boolean){
        this.btn_Submit.interactable = state;
    }

    onFanHui() {
        UIManager.getInstance().closeUI(GamePanel);
        UIManager.getInstance().closeUI(UploadAndReturnPanel);
    }

    onTiJiao() {
        UIManager.getInstance().showUI(SubmissionPanel);
    }
}
