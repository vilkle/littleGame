import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';

const {ccclass, property} = cc._decorator;

@ccclass
export default class GreenBlock extends cc.Component {

    @property(cc.Node)
    node_touchNode:cc.Node = null;

    @property(cc.Node)
    node_AnimatorNode:cc.Node = null;

   
    start () {
        this.node_touchNode.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart.bind(this), this);
        this.node_touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove.bind(this), this);
        this.node_touchNode.on(cc.Node.EventType.TOUCH_END, this.OnTouchMoveEnd.bind(this), this);
        this.node_touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchMoveEnd.bind(this), this);
        this.PlayInitAninator();

    }

    OnTouchStart(event: cc.Touch) {
        var touches = event.getLocation();
        let LocalPos = this.node.getParent().convertToNodeSpaceAR(touches);
        ListenerManager.getInstance().trigger(ListenerType.onGreenBlockStart,touches);
    }

    OnTouchMove(event: cc.Touch) {
      
         let self = this;
        var worldPos =event.getLocation();
        ListenerManager.getInstance().trigger(ListenerType.onGreenBlockMove,worldPos);

       
    }

    OnTouchMoveEnd(event) {
        var worldPos =event.getLocation();
        ListenerManager.getInstance().trigger(ListenerType.onGreenBlockEnd,worldPos);
    }

    PlayInitAninator(){
        this.node_AnimatorNode.stopAllActions();
        this.node_AnimatorNode.setScale(0.01);
        let seq = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                console.log("到动画")
            }),
            cc.scaleTo(0.3,1.3),
            cc.scaleTo(0.1,1,1),
        );
        this.node_AnimatorNode.runAction(seq);
    }

}
