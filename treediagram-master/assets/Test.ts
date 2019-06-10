import TreeData from './scripts/Data/TreeData';
import { ItemLineData } from './scripts/UI/panel/TeacherPanel';
const {ccclass, property} = cc._decorator;

@ccclass
export default class Test extends cc.Component {

    

    @property(cc.Node)
    img_hand: cc.Node = null;


    start () {
        this.playerHandAnimator();
    }

    /* 播放手动画 */
    playerHandAnimator(){
        let pos = this.img_hand.getPosition();
        this.img_hand.stopAllActions();
        let seq = cc.repeat(cc.sequence(
            cc.moveTo(0.2,pos.x +20,pos.y -20),
            cc.moveTo(0.2,pos.x ,pos.y),
        ),3);

        // 让节点左右来回移动，并重复5次
        this.img_hand.runAction(seq);

    }



    // update (dt) {}
}
