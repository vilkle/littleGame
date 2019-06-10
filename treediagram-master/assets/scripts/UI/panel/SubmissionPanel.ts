import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import { NetWork } from "../../Http/NetWork";
import { UIHelp } from "../../Utils/UIHelp";
import GamePanel from './GamePanel';
import { ListenerType } from '../../Data/ListenerType';
import { ListenerManager } from '../../Manager/ListenerManager';
import TeacherPanel from './TeacherPanel';
import { GameData } from '../../Data/GameData';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SubmissionPanel extends BaseUI {

    protected static className = "SubmissionPanel";
    
    @property(cc.Label)
    label_des:cc.Label =null;

    start() {

    }
    
    init(number:number){
        this.label_des.string = "共有"+number+"种不同的分类";
    }

    onQueDingBtnClick(event) {
        this.node.active =false;
        UIManager.getInstance().openUI(GamePanel);
        GameData.getInstance().nowState =2;
    }

    onQuXiaoBtnClick(event) {
        this.node.active =false;
    }

   
}
